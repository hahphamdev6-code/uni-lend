package com.unilend.backend.dto.issue;

import com.unilend.backend.entity.LoanIssueType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanIssueUpdateRequest {

    private LoanIssueType type;

    @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự")
    private String description;

    private Long version;
}
