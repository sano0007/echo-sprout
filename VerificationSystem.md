# Verification System

Created: August 15, 2025 2:54 PM

## 1. Project Submission to Verification Workflow

```mermaid
graph TD
    A[Project Creator Submits Project] --> B[System Auto-Validation]
    B --> C{All Required Documents?}
    C -->|No| D[Return to Creator with Missing Items List]
    C -->|Yes| E[Create Verification Request]
    E --> F[Assign to Verification Queue]
    F --> G[Send Notification to Verification Team]
    G --> H[Send Confirmation to Project Creator]

    D --> I[Creator Uploads Missing Documents]
    I --> B

```

### Detailed Steps:

1. **Project Creator Action**: Submit completed project with all documentation
2. **System Validation**: Check for required documents (PDD, location data, timeline)
3. **Queue Assignment**: Auto-assign based on project type and verifier workload
4. **Notification**: Email alerts to assigned verification team
5. **Status Update**: Project status changes to "Pending Verification"

---

## 2. Verification Assignment & Queue Management Workflow

```mermaid
graph TD
    A[New Verification Request] --> B[System Analyzes Project Type]
    B --> C{Specialized Verifier Needed?}
    C -->|Yes| D[Assign to Specialist Queue]
    C -->|No| E[Check Verifier Workload]
    E --> F[Auto-Assign to Available Verifier]
    F --> G[Update Verifier Dashboard]
    G --> H[Send Assignment Notification]

    D --> I[Manual Assignment by Admin]
    I --> G

    H --> J[Verifier Accepts/Declines]
    J --> K{Accepted?}
    K -->|No| L[Reassign to Another Verifier]
    K -->|Yes| M[Start Verification Process]

    L --> E

```

### Key Features:

- **Workload Balancing**: Automatic distribution based on current caseload
- **Specialization Matching**: Route projects to verifiers with relevant expertise
- **Manual Override**: Admin can reassign if needed
- **Acceptance Tracking**: Verifiers must confirm acceptance

---

## 3. Document Review & Verification Process Workflow

```mermaid
graph TD
    A[Verifier Starts Review] --> B[Open Verification Checklist]
    B --> C[Review Project Documentation]
    C --> D[Use Online Document Viewer]
    D --> E[Add Annotations & Notes]
    E --> F[Complete Checklist Items]
    F --> G{All Criteria Met?}

    G -->|No| H[Identify Issues]
    H --> I[Request Clarification/Revision]
    I --> J[Send Message to Creator]
    J --> K[Update Status: Revision Required]
    K --> L[Wait for Creator Response]
    L --> M[Creator Provides Updates]
    M --> C

    G -->|Yes| N[Calculate Quality Score]
    N --> O{Score ≥ Minimum Threshold?}
    O -->|No| P[Reject with Detailed Feedback]
    O -->|Yes| Q[Approve Project]

    P --> R[Generate Rejection Report]
    Q --> S[Generate Approval Certificate]

    R --> T[Send to Creator & Admin]
    S --> T
    T --> U[Update Project Status]

```

### Verification Checklist Components:

- **Environmental Impact**: Carbon reduction calculations, methodology validation
- **Project Feasibility**: Timeline, budget, technical approach
- **Documentation Quality**: Completeness, accuracy, compliance
- **Location Verification**: Geographic data, land rights, accessibility
- **Sustainability**: Long-term viability, maintenance plans

---

## 4. Communication Between Verifier & Creator Workflow

```mermaid
graph TD
    A[Verifier Identifies Issue] --> B[Create Communication Thread]
    B --> C[Compose Message with Specific Questions]
    C --> D[Attach Relevant Documents/Screenshots]
    D --> E[Set Priority Level]
    E --> F[Send Message]
    F --> G[Email Notification to Creator]
    G --> H[Creator Receives & Reviews]
    H --> I[Creator Responds]
    I --> J[Verifier Notification]
    J --> K{Issue Resolved?}

    K -->|No| L[Continue Discussion]
    K -->|Yes| M[Update Verification Status]

    L --> C
    M --> N[Log Resolution in Audit Trail]

```

### Communication Features:

- **Threaded Conversations**: Organized by topic/issue
- **File Attachments**: Support for documents, images, videos
- **Priority Levels**: Urgent, normal, low priority messaging
- **Auto-Notifications**: Email alerts for new messages
- **Read Receipts**: Confirmation when messages are viewed

---

## 5. Approval/Rejection Decision Workflow

```mermaid
graph TD
    A[Verification Complete] --> B{Final Decision}

    B -->|Approve| C[Generate Approval Certificate]
    C --> D[Create Digital Carbon Credits]
    D --> E[Update Project Status: Verified]
    E --> F[Notify Creator: Approved]
    F --> G[Add to Trading Marketplace]
    G --> H[Generate Verification Report]

    B -->|Reject| I[Document Rejection Reasons]
    I --> J[Generate Detailed Feedback Report]
    J --> K[Update Status: Rejected]
    K --> L[Notify Creator: Rejected]
    L --> M[Provide Improvement Guidelines]
    M --> N{Creator Wants to Resubmit?}

    N -->|Yes| O[Allow Project Revision]
    N -->|No| P[Archive Project]

    O --> Q[Creator Makes Improvements]
    Q --> R[Resubmit for Verification]
    R --> A

    H --> S[Update Audit Trail]
    P --> S

```

### Decision Outcomes:

- **Approved**: Credits created, project goes live in marketplace
- **Rejected**: Detailed feedback, option to revise and resubmit
- **Conditional Approval**: Minor changes required before final approval
- **Suspended**: Major issues requiring significant revision

---

## 6. Audit Trail & Reporting Workflow

```mermaid
graph TD
    A[Verification Activity] --> B[Log Action in Database]
    B --> C[Record Timestamp & User]
    C --> D[Store Action Details]
    D --> E[Update Activity History]
    E --> F{Generate Report?}

    F -->|Daily| G[Create Daily Summary]
    F -->|Weekly| H[Create Weekly Analytics]
    F -->|Monthly| I[Create Monthly Dashboard]
    F -->|Ad-hoc| J[Custom Report Request]

    G --> K[Send to Verification Manager]
    H --> L[Performance Analytics]
    I --> M[Compliance Reporting]
    J --> N[Generate Custom Report]

    K --> O[Store in Report Archive]
    L --> O
    M --> O
    N --> O

```

### Audit Trail Components:

- **User Actions**: Login, document access, decisions made
- **Timeline Tracking**: Start/end times, duration of reviews
- **Decision History**: Approval/rejection reasons, score changes
- **Communication Log**: All messages, file exchanges
- **System Events**: Automatic notifications, status changes

---

## System Integration Points

### Database Operations:

- **Real-time Updates**: Status changes propagated instantly
- **Backup Procedures**: Daily automated backups of verification data
- **Data Integrity**: Validation rules prevent inconsistent states

### External Integrations:

- **Email System**: Postmark for reliable notifications
- **File Storage**: Cloudinary for secure document management
- **Payment Gateway**: Stripe for financial transactions
- **Authentication**: Clerk for secure user management

### Performance Monitoring:

- **Response Times**: Track verification processing speeds
- **Success Rates**: Monitor approval/rejection ratios
- **User Satisfaction**: Regular feedback collection
- **System Health**: Automated monitoring and alerts