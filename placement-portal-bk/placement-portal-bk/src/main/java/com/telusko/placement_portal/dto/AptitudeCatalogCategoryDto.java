package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import java.util.List;

public record AptitudeCatalogCategoryDto(Category key, String label, long questionCount,
                                         List<AptitudeCatalogTopicDto> topics) { }
