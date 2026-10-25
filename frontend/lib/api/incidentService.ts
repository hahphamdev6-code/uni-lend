import type { AxiosRequestConfig } from "axios";
import apiClient from "./apiClient";
import type {
  ApiResponse,
  IncidentStatus,
  IncidentType,
  LoanIncident,
} from "./types";

export const incidentService = {
  async listByLoan(
    loanId: number,
    config?: Pick<AxiosRequestConfig, "signal">,
  ): Promise<LoanIncident[]> {
    const response = await apiClient.get<ApiResponse<LoanIncident[]>>(
      `/loan-requests/${loanId}/incidents`,
      config,
    );
    return response.data.data;
  },

  async create(
    loanId: number,
    input: { type: IncidentType; description: string },
  ): Promise<LoanIncident> {
    const response = await apiClient.post<ApiResponse<LoanIncident>>(
      `/loan-requests/${loanId}/incidents`,
      input,
    );
    return response.data.data;
  },

  async updateStatus(
    incidentId: number,
    input: { status: IncidentStatus; message: string },
  ): Promise<LoanIncident> {
    const response = await apiClient.patch<ApiResponse<LoanIncident>>(
      `/incidents/${incidentId}/status`,
      input,
    );
    return response.data.data;
  },
};
