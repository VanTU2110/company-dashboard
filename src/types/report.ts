
export interface CreateReportParams {
    reporterUuid: string;
    targetType: 'student';
    targetUuid: string;
    reason : 'inappropriate'|'spam'|'misleading'|'fake_information'|'wrong_category'|'offensive'|'scam_fraud'|'other';
    description?: string;
    createdAt?: string;
}
export interface Report {
    uuid: string;
    reporterUuid: string;
    targetType: 'student'|'company'|'job';
    targetUuid: string;
    reason : 'inappropriate'|'spam'|'misleading'|'fake_information'|'wrong_category'|'offensive'|'scam_fraud'|'other';
    description?: string;
    status: 'pending'|'resolved'|'rejected';
    createdAt: string;
}

export interface ReportResponse {
    data: Report;
    error: {
        code: string;
        message: string;
    };
}
