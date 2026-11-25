package com.telusko.placement_portal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.*;
import com.telusko.placement_portal.repository.*;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ResumeAnalysisService {
    private final ResumeAnalysisRepository analyses;private final StudentService students;private final JobRepo jobs;private final ResumeAnalyzerService analyzer;private final ObjectMapper mapper;
    public ResumeAnalysisService(ResumeAnalysisRepository analyses,StudentService students,JobRepo jobs,ResumeAnalyzerService analyzer,ObjectMapper mapper){this.analyses=analyses;this.students=students;this.jobs=jobs;this.analyzer=analyzer;this.mapper=mapper;}

    public ResumeAnalysisViewDto analyze(UserPrincipal user,String requestedFilename,String pastedJobDescription,Long jobId,String requestKey){
        Student student=students.getOrCreateProfile(user);String filename=student.getResume();if(filename==null||filename.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Upload a PDF resume to analyze it.");
        if(requestedFilename!=null&&!requestedFilename.isBlank()&&!requestedFilename.equals(filename))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"You can analyze only the resume saved to your own profile.");
        if(!isSafeFilename(filename))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The saved resume filename is invalid. Upload the PDF again from your profile.");
        String key=validRequestKey(requestKey)?requestKey:UUID.randomUUID().toString();Optional<ResumeAnalysis> previous=analyses.findByStudent_IdAndRequestKey(user.getId(),key);
        if(previous.isPresent()){ResumeAnalysis prior=previous.get();if(prior.getStatus()==ResumeAnalysis.Status.COMPLETED)return view(prior);if(prior.getStatus()==ResumeAnalysis.Status.PROCESSING)throw new ResponseStatusException(HttpStatus.CONFLICT,"This analysis request is already processing.");prior.setStatus(ResumeAnalysis.Status.PROCESSING);prior.setUserMessage(null);prior.setAnalyzedAt(LocalDateTime.now());analyses.save(prior);return run(prior,student,pastedJobDescription,jobId);}
        String jobDescription=pastedJobDescription;String jobTitle=null,company=null;
        if(jobId!=null){Job job=jobs.findById(jobId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Selected job was not found."));jobTitle=job.getTitle();company=job.getCompany();jobDescription=jobText(job);}
        if(jobDescription!=null&&jobDescription.length()>20000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Job description must be 20,000 characters or fewer.");
        if(jobId==null&&jobDescription!=null&&jobDescription.isBlank())jobDescription=null;
        if(jobId==null&&jobDescription==null&&pastedJobDescription!=null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter a job description, or clear it for a general resume analysis.");
        Path directory=Path.of("uploads","resume").toAbsolutePath().normalize();Path pdf=directory.resolve(filename).normalize();if(!pdf.startsWith(directory)||!Files.isRegularFile(pdf))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Your saved resume PDF could not be found. Upload it again and retry.");
        byte[] bytes;try{long size=Files.size(pdf);if(size>5L*1024*1024)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Resume must be 5 MB or smaller.");bytes=Files.readAllBytes(pdf);}catch(ResponseStatusException e){throw e;}catch(IOException e){throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Could not read your saved resume.");}
        ResumeAnalysis record=new ResumeAnalysis();record.setStudent(student);record.setResumeFilename(filename);record.setRequestKey(key);record.setResumeSha256(sha256(bytes));record.setJobId(jobId);record.setJobTitle(jobTitle);record.setJobCompany(company);record.setModelIdentifier(analyzer.getModelIdentifier());record.setStatus(ResumeAnalysis.Status.PROCESSING);record.setAnalyzedAt(LocalDateTime.now());analyses.save(record);
        return run(record,student,jobDescription,jobId);
    }
    private ResumeAnalysisViewDto run(ResumeAnalysis record,Student student,String jobDescription,Long jobId){try{Path pdf=Path.of("uploads","resume",record.getResumeFilename()).toAbsolutePath().normalize();byte[] bytes=Files.readAllBytes(pdf);String text=analyzer.extractText(bytes);Map<String,Object> result=analyzer.analyzeStructured(text,jobDescription);record.setResumeScore((Integer)result.get("score"));Object job=result.get("jobMatch");if(job instanceof Map<?,?> m&&m.get("score") instanceof Number n)record.setJobMatchScore(n.intValue());else record.setJobMatchScore(null);record.setCategoryScoresJson(mapper.writeValueAsString(result.get("categories")));record.setAnalysisJson(mapper.writeValueAsString(result));record.setStatus(ResumeAnalysis.Status.COMPLETED);record.setUserMessage(null);return view(analyses.save(record));}
        catch(ResponseStatusException e){record.setStatus(ResumeAnalysis.Status.FAILED);record.setUserMessage(safeMessage(e));analyses.save(record);throw e;}
        catch(Exception e){record.setStatus(ResumeAnalysis.Status.FAILED);record.setUserMessage("Resume analysis could not be saved. Please retry.");analyses.save(record);throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Resume analysis could not be completed. Please retry.");}}
    private String jobText(Job job){return "Job title: "+safe(job.getTitle())+"\nCompany: "+safe(job.getCompany())+"\nJob type: "+safe(job.getJobType())+"\nRequired skills listed: "+safe(job.getSkills())+"\nEligibility: "+safe(job.getEligibility())+"\nDescription: "+safe(job.getDescription())+"\nResponsibilities: "+safe(job.getResponsibilities());}
    private String safe(String s){return s==null?"Not listed":s;}
    private boolean isSafeFilename(String filename){
        if(filename==null||filename.isBlank()||filename.length()>255||filename.contains("/")||filename.contains("\\"))return false;
        try{return !filename.equals(".")&&!filename.equals("..")&&Path.of(filename).getFileName().toString().equals(filename);}
        catch(InvalidPathException ex){return false;}
    }
    private String safeMessage(ResponseStatusException e){return Optional.ofNullable(e.getReason()).filter(reason->!reason.isBlank()).orElse("Resume analysis could not be completed. Please retry.");}
    private boolean validRequestKey(String key){return key!=null&&key.length()>=8&&key.length()<=100&&key.matches("[A-Za-z0-9._:-]+");}
    private String sha256(byte[] b){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}catch(Exception e){throw new IllegalStateException(e);}}

    public ResumeAnalysisViewDto latest(UserPrincipal user){return analyses.findFirstByStudent_IdAndStatusOrderByAnalyzedAtDesc(user.getId(),ResumeAnalysis.Status.COMPLETED).map(this::view).orElse(null);}
    public List<ResumeAnalysisViewDto> history(UserPrincipal user,int limit){return analyses.findAllByStudent_IdOrderByAnalyzedAtDesc(user.getId(),PageRequest.of(0,Math.max(1,Math.min(limit,100)))).stream().map(this::view).toList();}
    public ResumeAnalysisViewDto get(UserPrincipal user,long id){return analyses.findByIdAndStudent_Id(id,user.getId()).map(this::view).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Resume analysis was not found."));}
    public List<ResumeTrendPointDto> trend(UserPrincipal user){return analyses.findAllByStudent_IdOrderByAnalyzedAtDesc(user.getId(),PageRequest.of(0,100)).stream().filter(a->a.getStatus()==ResumeAnalysis.Status.COMPLETED).sorted(Comparator.comparing(ResumeAnalysis::getAnalyzedAt)).map(a->{Map<String,Object> parsed=parseJson(a.getAnalysisJson());Object cats=parsed.get("categories");return new ResumeTrendPointDto(a.getId(),a.getAnalyzedAt(),a.getResumeFilename(),a.getResumeScore(),a.getJobMatchScore(),cats instanceof Map<?,?> m?(Map<String,Object>)m:Map.of());}).toList();}
    public Map<String,Object> compare(UserPrincipal user,ResumeCompareRequest req){ResumeAnalysisViewDto first=get(user,req.firstAnalysisId()),second=get(user,req.secondAnalysisId());Map<String,Object> a=first.analysis(),b=second.analysis();Map<String,Object> ac=asMap(a.get("categories")),bc=asMap(b.get("categories"));Map<String,Object> changes=new LinkedHashMap<>();for(String key:ResumeAnalyzerService.CATEGORY_KEYS){Map<String,Object> x=asMap(ac.get(key)),y=asMap(bc.get(key));Integer xs=score(x),ys=score(y);changes.put(key,Map.of("before",Objects.toString(xs,"Not scored"),"after",Objects.toString(ys,"Not scored"),"change",xs==null||ys==null?"Not comparable":(ys-xs)));}Set<String> oldIssues=new LinkedHashSet<>(listStrings(a.get("weaknesses")));Set<String> newIssues=new LinkedHashSet<>(listStrings(b.get("weaknesses")));Set<String> newly=new LinkedHashSet<>(newIssues);newly.removeAll(oldIssues);return Map.of("first",first,"second",second,"scoreChange",first.score()==null||second.score()==null?0:second.score()-first.score(),"categoryChanges",changes,"remainingWeaknesses",newIssues,"newlyIdentifiedIssues",newly);}
    public Map<String,Object> improve(UserPrincipal user,ResumeImprovementRequest request){students.getOrCreateProfile(user);return analyzer.improveSection(request.section(),request.originalText(),request.instructions());}
    public Map<String,Object> options(){Map<String,Integer> weights=new LinkedHashMap<>();for(int i=0;i<ResumeAnalyzerService.CATEGORY_KEYS.length;i++)weights.put(ResumeAnalyzerService.CATEGORY_KEYS[i],ResumeAnalyzerService.CATEGORY_WEIGHTS[i]);return Map.of("categoryWeights",weights,"sections",List.of("professionalSummary","projects","experience","technicalSkills","achievements","education"),"atsDisclaimer","This is an AI-generated estimate, not an official ATS score or guarantee of selection.");}
    private ResumeAnalysisViewDto view(ResumeAnalysis a){return new ResumeAnalysisViewDto(a.getId(),a.getResumeFilename(),a.getResumeScore(),a.getJobMatchScore(),a.getJobId(),a.getJobTitle(),a.getJobCompany(),a.getModelIdentifier(),a.getStatus(),a.getUserMessage(),a.getAnalyzedAt(),parseJson(a.getAnalysisJson()));}
    private Map<String,Object> parseJson(String raw){if(raw==null||raw.isBlank())return Map.of();try{return mapper.readValue(raw,new TypeReference<>(){});}catch(Exception e){return Map.of();}}
    @SuppressWarnings("unchecked") private Map<String,Object> asMap(Object v){return v instanceof Map<?,?>?(Map<String,Object>)v:Map.of();}
    private Integer score(Map<String,Object> category){Object v=category.get("score");if(v instanceof Number n)return n.intValue();if(v instanceof String s)try{return Integer.parseInt(s);}catch(Exception ignored){}return null;}
    private List<String> listStrings(Object v){return v instanceof List<?> l?l.stream().filter(String.class::isInstance).map(String.class::cast).toList():List.of();}
}
