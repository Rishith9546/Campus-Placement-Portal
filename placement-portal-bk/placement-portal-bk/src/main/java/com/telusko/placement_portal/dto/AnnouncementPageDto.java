package com.telusko.placement_portal.dto;
import java.util.List;
public record AnnouncementPageDto(List<AnnouncementDto> content,int page,int size,long totalElements,int totalPages) {}
