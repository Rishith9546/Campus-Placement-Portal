package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.*;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/** Deterministic match: required skills 60%, branch 20%, CGPA 20%, normalized over criteria the job actually specifies. */
@Service
public class JobMatchService {
    private static final int SKILL_WEIGHT = 60;
    private static final int BRANCH_WEIGHT = 20;
    private static final int CGPA_WEIGHT = 20;
    private static final Pattern CGPA = Pattern.compile("(?i)(?:\\b(?:minimum|min|at\\s+least|greater\\s+than|above|>=|>)\\s*(?:required\\s*)?(?:cgpa|gpa)?\\s*(?:of\\s*)?|\\b(?:cgpa|gpa)\\s*(?:(?:>=|>|:|of|is|minimum|min|at\\s+least|must\\s+be|above|greater\\s+than)\\s*)?)([0-9](?:\\.[0-9]{1,2})?)");
    private static final Pattern YEAR_RANGE = Pattern.compile("\\b(20\\d{2})\\s*(?:-|to)\\s*(20\\d{2})\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern YEAR_SINGLE = Pattern.compile("(?i)(?:(?:batch|graduat(?:ion|ing)|pass(?:ing)?\\s*out|year)[^0-9]{0,12}(20\\d{2})|(20\\d{2})\\s*(?:batch|passout))");
    private static final Pattern MAX_BACKLOG = Pattern.compile("(?i)(?:max(?:imum)?|up\\s*to|at\\s*most)\\s*(\\d+)\\s*(?:active\\s*)?(?:backlogs?|arrears?)");
    private static final List<List<String>> BRANCH_ALIASES = List.of(
            List.of("computer science and engineering", "computer science engineering", "computer science", "cse", "cs"),
            List.of("electronics and communication engineering", "electronics and communication", "electronics", "ece"),
            List.of("electrical and electronics engineering", "electrical and electronics", "eee"),
            List.of("electrical engineering", "electrical", "ee"),
            List.of("information technology", "information tech", "it"),
            List.of("mechanical engineering", "mechanical", "me"),
            List.of("civil engineering", "civil", "ce"),
            List.of("chemical engineering", "chemical", "che")
    );
    private final JobRepo jobs;
    private final StudentRepo students;
    private final ApplicationRepo applications;
    public JobMatchService(JobRepo jobs, StudentRepo students, ApplicationRepo applications) { this.jobs=jobs;this.students=students;this.applications=applications; }

    public JobMatchSummaryDto summary(UserPrincipal principal) { return summary(principal, "ALL", null); }
    public JobMatchSummaryDto summary(UserPrincipal principal,String filter,String search) {
        Student student=students.findById(principal.getId()).orElse(null);
        List<application> savedApps=applications.findByStudentId(principal.getId());
        Map<Long,String> appStatus=new HashMap<>();for(application app:savedApps)if(app.getJobId()!=null)appStatus.put(app.getJobId(),blank(app.getStatus())?"APPLIED":app.getStatus());
        LocalDate today=LocalDate.now();
        List<JobMatchDto> matches=jobs.findStudentVisibleJobs(today).stream()
                .filter(j->search==null||search.isBlank()||searchMatch(j,search.trim()))
                .map(j->evaluate(j,student,appStatus.get(j.getId())))
                .filter(m->accepts(filter,m))
                .sorted(Comparator.comparingInt((JobMatchDto m)->"ELIGIBLE".equals(m.eligibilityStatus())?1:0).reversed()
                        .thenComparing(JobMatchDto::matchScore,Comparator.reverseOrder())
                        .thenComparing(m->m.deadline()==null?LocalDate.MAX:m.deadline()))
                .toList();
        int average=matches.isEmpty()?0:(int)Math.round(matches.stream().filter(JobMatchDto::matchScoreAvailable).mapToInt(JobMatchDto::matchScore).average().orElse(0));
        JobMatchDto top=matches.stream().findFirst().orElse(null);
        JobMatchDto eligible=matches.stream().filter(m->"ELIGIBLE".equals(m.eligibilityStatus())).findFirst().orElse(null);
        LinkedHashSet<String> focus=new LinkedHashSet<>();matches.stream().filter(m->!m.applied()).flatMap(m->m.missingSkills().stream()).forEach(focus::add);
        return new JobMatchSummaryDto(matches.size(),(int)matches.stream().filter(m->"ELIGIBLE".equals(m.eligibilityStatus())).count(),(int)matches.stream().filter(m->"NEEDS_REVIEW".equals(m.eligibilityStatus())).count(),(int)matches.stream().filter(m->m.matchScore()>=70).count(),(int)matches.stream().filter(JobMatchDto::applied).count(),average,top,eligible,focus.stream().limit(8).toList(),matches);
    }
    public JobMatchDto details(UserPrincipal principal,long jobId) {
        Student student=students.findById(principal.getId()).orElse(null);
        Job job=jobs.findStudentVisibleJob(jobId, LocalDate.now()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Job not found."));
        String status=applications.findByStudentIdAndJobId(principal.getId(),jobId).map(a->blank(a.getStatus())?"APPLIED":a.getStatus()).orElse(null);
        return evaluate(job,student,status);
    }

    /** Shared deterministic scorer used by recruiter candidate ranking. */
    public JobMatchDto evaluateCandidate(Job job, Student student, String applicationStatus) {
        return evaluate(job, student, applicationStatus);
    }
    private boolean searchMatch(Job j,String q){String s=q.toLowerCase(Locale.ROOT);return contains(j.getTitle(),s)||contains(j.getCompany(),s)||contains(j.getLocation(),s)||contains(j.getJobType(),s)||contains(j.getSkills(),s);}
    private boolean contains(String value,String q){return value!=null&&value.toLowerCase(Locale.ROOT).contains(q);}
    private boolean accepts(String filter,JobMatchDto m){return switch(filter==null?"ALL":filter.toUpperCase(Locale.ROOT)){case "ELIGIBLE"->"ELIGIBLE".equals(m.eligibilityStatus());case "HIGH_MATCH"->m.matchScore()>=70;case "MISSING_SKILLS"->!m.missingSkills().isEmpty();case "APPLIED"->m.applied();default->true;};}

    private JobMatchDto evaluate(Job job,Student student,String applicationStatus){
        List<String> required=splitSkills(job.getSkills());boolean skillsAvailable=student!=null&&!blank(student.getSkills());Set<String> studentSkills=!skillsAvailable?Set.of():splitSkills(student.getSkills()).stream().map(this::normalizeSkill).collect(Collectors.toSet());
        List<String> matched=!skillsAvailable?List.of():required.stream().filter(s->studentSkills.contains(normalizeSkill(s))).toList();
        List<String> missing=!skillsAvailable?List.of():required.stream().filter(s->!studentSkills.contains(normalizeSkill(s))).toList();
        Integer skillScore=required.isEmpty()||!skillsAvailable?null:percent(matched.size(),required.size());
        String criteria=job.getEligibility()==null?"":job.getEligibility().trim();String lower=criteria.toLowerCase(Locale.ROOT);
        List<String> reasons=new ArrayList<>();List<Integer> componentScores=new ArrayList<>();List<Integer> weights=new ArrayList<>();
        if(skillScore!=null){componentScores.add(skillScore);weights.add(SKILL_WEIGHT);}
        boolean hardFail=false,needsReview=criteria.isBlank()||(!required.isEmpty()&&(student==null||blank(student.getSkills())));
        if(!required.isEmpty()&&(student==null||blank(student.getSkills()))) reasons.add("Student skills are unavailable, so the skills match needs manual review.");
        if(criteria.isBlank())reasons.add("The recruiter did not provide written eligibility criteria; confirm requirements with the placement cell.");
        else reasons.add("Eligibility criteria are taken from the recruiter’s job posting.");

        List<List<String>> eligibleBranches=matchedBranches(lower);
        boolean branchRestricted=!eligibleBranches.isEmpty()||lower.contains("branch")||lower.contains("branches");
        boolean allBranches=lower.matches("(?s).*\\b(all|any)\\s+branches?\\b.*")||lower.contains("all streams");
        Integer branchScore=null;
        if(branchRestricted&&!allBranches){
            if(eligibleBranches.isEmpty()){needsReview=true;reasons.add("Branch restriction is stated but the allowed branches could not be parsed.");}
            else if(student==null||blank(student.getBranch())){needsReview=true;reasons.add("Add your branch to your profile to verify this requirement.");}
            else {boolean ok=eligibleBranches.stream().anyMatch(group->branchMatches(student.getBranch(),group));branchScore=ok?100:0;componentScores.add(branchScore);weights.add(BRANCH_WEIGHT);if(ok)reasons.add("Your branch matches the listed eligible branches.");else{hardFail=true;reasons.add("Your branch does not match the listed eligible branches.");}}
        }
        Double minimumCgpa=parseMinimumCgpa(criteria);Integer cgpaScore=null;
        if(minimumCgpa!=null){if(student==null||student.getCgpa()==null){needsReview=true;reasons.add("Add your CGPA to verify the minimum CGPA requirement.");}else{boolean strict=Pattern.compile("(?i)(?:\\b(?:cgpa|gpa)\\s*>|>\\s*(?:cgpa|gpa)?)").matcher(criteria).find();boolean ok=strict?student.getCgpa()>minimumCgpa:student.getCgpa()>=minimumCgpa;cgpaScore=ok?100:0;componentScores.add(cgpaScore);weights.add(CGPA_WEIGHT);if(ok)reasons.add("Your CGPA meets the minimum of "+minimumCgpa+".");else{hardFail=true;reasons.add("Your CGPA is below the minimum of "+minimumCgpa+".");}}}
        if(hasCgpaMention(criteria)&&minimumCgpa==null){needsReview=true;reasons.add("CGPA is mentioned, but its threshold could not be parsed.");}

        Integer maxBacklogs=parseMaxBacklogs(criteria);boolean zeroBacklogs=lower.matches("(?s).*(?:no|zero|without)\\s+(?:active\\s+)?backlogs?.*");
        if(maxBacklogs!=null||zeroBacklogs){int max=zeroBacklogs?0:maxBacklogs;if(student==null||student.getBacklogs()==null){needsReview=true;reasons.add("Add your backlog count to verify the backlog requirement.");}else if(student.getBacklogs()>max){hardFail=true;reasons.add("The profile backlog count is above the allowed maximum of "+max+".");}else reasons.add("Your backlog count meets the stated restriction.");}
        if((lower.contains("backlog")||lower.contains("arrear"))&&maxBacklogs==null&&!zeroBacklogs){needsReview=true;reasons.add("A backlog restriction is present but could not be parsed.");}

        int[] yearRange=parseYearRange(criteria);Integer requiredYear=parseSingleYear(criteria);if(yearRange!=null||requiredYear!=null){if(student==null||student.getGraduationYear()==null){needsReview=true;reasons.add("Add your graduation year to verify the batch requirement.");}else{boolean ok=yearRange!=null?student.getGraduationYear()>=yearRange[0]&&student.getGraduationYear()<=yearRange[1]:student.getGraduationYear().equals(requiredYear);if(!ok){hardFail=true;reasons.add("Your graduation year does not match the stated batch requirement.");}else reasons.add("Your graduation year matches the stated batch requirement.");}}
        if((lower.contains("batch")||lower.contains("graduat")||lower.contains("pass out"))&&yearRange==null&&requiredYear==null){needsReview=true;reasons.add("A graduation-year requirement is present but could not be parsed.");}
        if(hasUnparsedRequirement(criteria,eligibleBranches,minimumCgpa,maxBacklogs,zeroBacklogs,yearRange,requiredYear)){needsReview=true;reasons.add("Some recruiter-defined criteria need manual review because this posting uses requirements not represented in the current student profile.");}

        String eligibility=hardFail?"NOT_ELIGIBLE":needsReview?"NEEDS_REVIEW":"ELIGIBLE";
        if(!hardFail&&!needsReview&&!criteria.isBlank())reasons.add("All parsed mandatory eligibility criteria are satisfied.");
        int weightSum=weights.stream().mapToInt(Integer::intValue).sum();int weightedTotal=0;for(int i=0;i<weights.size();i++)weightedTotal+=componentScores.get(i)*weights.get(i);int score=weightSum==0?0:(int)Math.round(weightedTotal/(double)weightSum);
        boolean scoreAvailable=weightSum>0;
        List<String> branchNames=eligibleBranches.stream().map(group->group.get(0)).toList();
        Integer allowedBacklogs=maxBacklogs!=null?maxBacklogs:zeroBacklogs?0:null;
        Integer minGradYear=yearRange!=null?Integer.valueOf(yearRange[0]):requiredYear;Integer maxGradYear=yearRange!=null?Integer.valueOf(yearRange[1]):requiredYear;
        return new JobMatchDto(job.getId(),job.getTitle(),job.getCompany(),job.getLocation(),job.getJobType(),job.getSalary(),job.getDeadline(),job.getDescription(),job.getEligibility(),eligibility,List.copyOf(reasons),score,scoreAvailable,skillScore,branchScore,cgpaScore,required,matched,missing,List.of(),minimumCgpa,branchNames,allowedBacklogs,minGradYear,maxGradYear,missing.stream().limit(5).toList(),applicationStatus,applicationStatus!=null,job.acceptsApplications(LocalDate.now()));
    }
    private List<List<String>> matchedBranches(String criteria){return BRANCH_ALIASES.stream().filter(group->group.stream().anyMatch(alias->containsToken(criteria,alias))).toList();}
    private boolean containsToken(String source,String token){String norm=source.toLowerCase(Locale.ROOT);if(token.length()<=3)return Pattern.compile("(?<![a-z0-9])"+Pattern.quote(token)+"(?![a-z0-9])").matcher(norm).find();return norm.contains(token);}
    private boolean branchMatches(String student,List<String> aliases){String normalized=normalizeText(student);return aliases.stream().anyMatch(alias->normalized.equals(normalizeText(alias))||normalized.contains(normalizeText(alias))||normalizeText(alias).contains(normalized));}
    private Double parseMinimumCgpa(String criteria){Matcher m=CGPA.matcher(criteria);if(!m.find())return null;try{return Double.parseDouble(m.group(1));}catch(NumberFormatException e){return null;}}
    private boolean hasCgpaMention(String criteria){return criteria.toLowerCase(Locale.ROOT).contains("cgpa")||criteria.toLowerCase(Locale.ROOT).contains("gpa");}
    private Integer parseMaxBacklogs(String criteria){Matcher m=MAX_BACKLOG.matcher(criteria);return m.find()?Integer.parseInt(m.group(1)):null;}
    private int[] parseYearRange(String criteria){Matcher m=YEAR_RANGE.matcher(criteria);if(!m.find())return null;return new int[]{Integer.parseInt(m.group(1)),Integer.parseInt(m.group(2))};}
    private Integer parseSingleYear(String criteria){Matcher m=YEAR_SINGLE.matcher(criteria);if(!m.find())return null;return Integer.parseInt(m.group(1)!=null?m.group(1):m.group(2));}
    private boolean hasUnparsedRequirement(String criteria,List<List<String>> branches,Double cgpa,Integer backlog,boolean zeroBacklogs,int[] years,Integer year){
        if(criteria.isBlank())return false;String rest=criteria.toLowerCase(Locale.ROOT);
        for(List<String> group:BRANCH_ALIASES)for(String alias:group)rest=rest.replaceAll("(?<![a-z0-9])"+Pattern.quote(alias)+"(?![a-z0-9])"," ");
        if(cgpa!=null)rest=CGPA.matcher(rest).replaceAll(" ");
        if(backlog!=null)rest=MAX_BACKLOG.matcher(rest).replaceAll(" ");
        if(zeroBacklogs)rest=rest.replaceAll("(?:no|zero|without)\\s+(?:active\\s+)?backlogs?"," ");
        if(years!=null)rest=YEAR_RANGE.matcher(rest).replaceAll(" ");if(year!=null)rest=YEAR_SINGLE.matcher(rest).replaceAll(" ");
        rest=rest.replaceAll("\\b(?:all|any|branch|branches|streams|eligible|eligibility|for|only|minimum|min|required|requirement|requirements|cgpa|gpa|of|at|least|above|greater|than|or|and|with|without|active|backlog|backlogs|arrear|arrears|zero|no|the|a|an|candidate|candidates|should|must|be|is|are|have|has|from|batch|year|graduation|graduating|pass|out|202[0-9])\\b"," ").replaceAll("[^a-z0-9]+"," ").trim();
        return !rest.isBlank();
    }
    private List<String> splitSkills(String raw){if(blank(raw))return List.of();LinkedHashMap<String,String> unique=new LinkedHashMap<>();for(String value:raw.split("[,;|\\n]+")){String skill=value.trim();if(!skill.isBlank())unique.putIfAbsent(normalizeSkill(skill),skill);}return List.copyOf(unique.values());}
    private String normalizeSkill(String value){String s=normalizeText(value);Map<String,String> aliases=Map.ofEntries(Map.entry("react js","react"),Map.entry("reactjs","react"),Map.entry("springboot","spring boot"),Map.entry("node js","node"),Map.entry("nodejs","node"),Map.entry("vue js","vue"),Map.entry("vuejs","vue"),Map.entry("dotnet",".net"));return aliases.getOrDefault(s,s);}
    private String normalizeText(String value){return value==null?"":value.toLowerCase(Locale.ROOT).replaceAll("\\.js\\b"," js").replaceAll("[^a-z0-9+#.]+"," ").replaceAll("\\s+"," ").trim();}
    private int percent(int n,int d){return d==0?0:(int)Math.round(n*100.0/d);}
    private boolean blank(String s){return s==null||s.isBlank();}
}
