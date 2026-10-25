package com.unilend.backend.dto.issue;

import com.unilend.backend.entity.LoanIssueStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanIssueProcessRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private LoanIssueStatus status;

    @Size(max = 1000, message = "Ghi chú quyết định tối đa 1000 ký tự")
    private String decisionNote;

    private Long version;
}
