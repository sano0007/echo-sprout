# EcoSprout User Roles & Workflows

Created: August 15, 2025 3:44 PM

## Overview

EcoSprout serves four primary user roles, each with distinct workflows, permissions, and responsibilities within the carbon credit ecosystem.

---

## 1. Project Creator Role Workflows

### 1.1 Project Creator Registration & Onboarding

```mermaid
graph TD
    A[Visit EcoSprout Platform] --> B[Click 'Register as Project Creator']
    B --> C[Select User Type: Project Creator]
    C --> D[Complete Basic Information]
    D --> E[Upload Identity Documents]
    E --> F[Provide Organization Details]
    F --> G[Submit Project Concept Overview]
    G --> H[Email Verification]

    H --> I[System Validates Documents]
    I --> J{Validation Successful?}
    J -->|Yes| K[Account Approved]
    J -->|No| L[Request Additional Documentation]

    L --> M[Creator Provides Missing Info]
    M --> I

    K --> N[Send Welcome Email with Guidelines]
    N --> O[Access Creator Dashboard]
    O --> P[Complete Onboarding Tutorial]
    P --> Q[Ready to Submit Projects]

```

### 1.2 Project Development & Submission Workflow

```mermaid
graph TD
    A[Creator Logs into Dashboard] --> B[Click 'Create New Project']
    B --> C[Select Project Type]
    C --> D[Fill Project Basic Information]
    D --> E[Upload Project Documents]
    E --> F[Define Timeline & Milestones]
    F --> G[Calculate Environmental Impact]
    G --> H[Set Credit Pricing]
    H --> I[Add Project Photos/Videos]
    I --> J[Review Project Summary]

    J --> K{Save as Draft or Submit?}
    K -->|Save Draft| L[Store in Drafts]
    K -->|Submit| M[Final Validation Check]

    L --> N[Continue Editing Later]
    M --> O{All Required Fields Complete?}
    O -->|No| P[Show Missing Requirements]
    O -->|Yes| Q[Submit for Verification]

    P --> D
    Q --> R[Generate Submission Receipt]
    R --> S[Send to Verification Queue]
    S --> T[Notify Creator of Submission]
    T --> U[Track Verification Status]

```

### 1.3 Project Management & Progress Reporting

```mermaid
graph TD
    A[Project Approved & Active] --> B[Receive Monthly Reporting Reminder]
    B --> C[Access Progress Reporting Portal]
    C --> D[Update Project Status]
    D --> E[Upload Progress Photos]
    E --> F[Enter Environmental Metrics]
    F --> G[Report Milestone Completion]
    G --> H[Address Any Issues/Challenges]
    H --> I[Submit Progress Report]

    I --> J[System Validates Report]
    J --> K{Report Complete?}
    K -->|No| L[Show Missing Information]
    K -->|Yes| M[Save Report]

    L --> D
    M --> N[Notify Buyers of Update]
    N --> O[Update Project Dashboard]
    O --> P[Generate Carbon Credits]
    P --> Q[Credits Available for Sale]
    Q --> R[Monitor Sales Performance]
    R --> S[Receive Revenue Payments]

```

### 1.4 Revenue Management & Analytics

```mermaid
graph TD
    A[Credits Sold] --> B[Revenue Notification]
    B --> C[Access Creator Financial Dashboard]
    C --> D[View Sales Analytics]
    D --> E[Track Revenue by Project]
    E --> F[Monitor Market Performance]
    F --> G[Download Financial Reports]
    G --> H[Process Tax Documentation]
    H --> I[Optimize Pricing Strategy]
    I --> J[Plan Future Projects]

```

---

## 2. Credit Buyer Role Workflows

### 2.1 Credit Buyer Registration & Profile Setup

```mermaid
graph TD
    A[Access EcoSprout Platform] --> B[Choose 'Buy Carbon Credits']
    B --> C[Register as Credit Buyer]
    C --> D{Buyer Type}
    D -->|Individual| E[Personal Information Form]
    D -->|SME| F[Small Business Details]
    D -->|Corporation| G[Corporate Information]
    D -->|Organization| H[Non-profit/NGO Details]

    E --> I[Basic Personal Profile]
    F --> J[Business Registration Info]
    G --> K[Corporate Sustainability Details]
    H --> L[Organization Mission & Goals]

    I --> M[Set Offset Goals]
    J --> M
    K --> M
    L --> M

    M --> N[Choose Notification Preferences]
    N --> O[Complete Email Verification]
    O --> P[Account Activated]
    P --> Q[Access Marketplace]

```

### 2.2 Credit Discovery & Selection Workflow

```mermaid
graph TD
    A[Buyer Accesses Marketplace] --> B[Browse Featured Projects]
    B --> C{Search Method}
    C -->|Browse Categories| D[Select Project Type]
    C -->|Use Search| E[Enter Search Criteria]
    C -->|Apply Filters| F[Set Location/Price Filters]

    D --> G[View Category Results]
    E --> H[View Search Results]
    F --> I[View Filtered Results]

    G --> J[Select Interesting Project]
    H --> J
    I --> J

    J --> K[Review Project Details]
    K --> L[Check Verification Status]
    L --> M[View Impact Metrics]
    M --> N[Read Creator Information]
    N --> O[Check Pricing Options]

    O --> P{Decision}
    P -->|Buy Now| Q[Proceed to Checkout]
    P -->|Save for Later| R[Add to Wishlist]
    P -->|Need More Info| S[Contact Project Creator]
    P -->|Continue Browsing| T[Return to Marketplace]

```

### 2.3 Purchase & Payment Workflow

```mermaid
graph TD
    A[Buyer Clicks 'Buy Now'] --> B[Select Quantity of Credits]
    B --> C[Review Purchase Summary]
    C --> D{User Account Status}
    D -->|Logged In| E[Pre-filled Checkout]
    D -->|Guest| F[Guest Checkout or Login]

    F --> G{User Choice}
    G -->|Guest| H[Enter Contact Information]
    G -->|Login| I[User Authentication]

    H --> J[Proceed to Payment]
    I --> E
    E --> J

    J --> K[Select Payment Method]
    K --> L{Payment Type}
    L -->|Credit Card| M[Enter Card Details]
    L -->|PayPal| N[PayPal Authentication]
    L -->|Bank Transfer| O[Bank Transfer Details]

    M --> P[Process Card Payment]
    N --> Q[Process PayPal Payment]
    O --> R[Generate Payment Instructions]

    P --> S{Payment Successful?}
    Q --> S
    R --> T[Manual Payment Verification]

    S -->|Yes| U[Generate Digital Certificate]
    S -->|No| V[Show Error & Retry Options]
    T --> W[Wait for Payment Confirmation]

    U --> X[Send Certificate via Email]
    V --> K
    W --> Y{Payment Received?}
    Y -->|Yes| U
    Y -->|No| Z[Cancel Order After Timeout]

    X --> AA[Update Buyer Dashboard]
    AA --> BB[Add to Impact Tracking]

```

### 2.4 Impact Tracking & Management

```mermaid
graph TD
    A[Purchase Complete] --> B[Access Buyer Dashboard]
    B --> C[View Purchase History]
    C --> D[Track Project Progress]
    D --> E[Receive Progress Updates]
    E --> F[View Environmental Impact]
    F --> G[Download Certificates]
    G --> H[Generate Impact Reports]
    H --> I[Share on Social Media]
    I --> J[Plan Additional Purchases]

```

---

## 3. Verifier Role Workflows

### 3.1 Verifier Registration & Qualification

```mermaid
graph TD
    A[Expert Applies as Verifier] --> B[Complete Verifier Application]
    B --> C[Submit Professional Credentials]
    C --> D[Provide Experience Documentation]
    D --> E[Complete Background Check]
    E --> F[Take Verification Training Course]
    F --> G[Pass Certification Exam]

    G --> H{Exam Results}
    H -->|Pass| I[Account Approved]
    H -->|Fail| J[Retake Training]

    J --> F
    I --> K[Receive Verifier Guidelines]
    K --> L[Access Verification Dashboard]
    L --> M[Assigned to Verification Team]
    M --> N[Ready for Project Assignments]

```

### 3.2 Project Assignment & Review Workflow

```mermaid
graph TD
    A[New Project Submitted] --> B[System Assigns to Verifier]
    B --> C[Verifier Receives Notification]
    C --> D[Access Verification Dashboard]
    D --> E[Review Project Assignment]
    E --> F{Accept Assignment?}

    F -->|No| G[Decline & Reassign]
    F -->|Yes| H[Start Verification Process]

    G --> I[System Finds Alternative Verifier]
    H --> J[Download Project Documents]
    J --> K[Review Project Design Document]
    K --> L[Check Environmental Methodology]
    L --> M[Validate Timeline & Budget]
    M --> N[Assess Technical Feasibility]
    N --> O[Review Location & Permits]

    O --> P[Complete Verification Checklist]
    P --> Q{Issues Found?}
    Q -->|Yes| R[Request Clarification from Creator]
    Q -->|No| S[Calculate Quality Score]

    R --> T[Wait for Creator Response]
    T --> U[Review Creator's Response]
    U --> V{Issues Resolved?}
    V -->|Yes| S
    V -->|No| W[Recommend Rejection]

    S --> X{Score Above Threshold?}
    X -->|Yes| Y[Recommend Approval]
    X -->|No| W

    Y --> Z[Generate Approval Report]
    W --> AA[Generate Rejection Report]
    Z --> BB[Submit Final Decision]
    AA --> BB
    BB --> CC[Update Project Status]

```

### 3.3 Ongoing Monitoring & Quality Assurance

```mermaid
graph TD
    A[Approved Project Active] --> B[Monitor Progress Reports]
    B --> C[Review Monthly Updates]
    C --> D[Validate Progress Photos]
    D --> E[Check Environmental Metrics]
    E --> F{Quality Concerns?}

    F -->|No| G[Approve Monthly Report]
    F -->|Yes| H[Flag for Additional Review]

    G --> I[Update Project Status]
    H --> J[Request Additional Information]
    J --> K[Conduct Site Visit if Needed]
    K --> L[Document Findings]
    L --> M{Issue Severity}

    M -->|Minor| N[Issue Guidance]
    M -->|Major| O[Require Corrective Action]
    M -->|Critical| P[Suspend Project]

    N --> Q[Monitor Improvement]
    O --> R[Set Compliance Deadline]
    P --> S[Investigate Thoroughly]

    R --> T[Review Corrective Actions]
    S --> U[Make Final Determination]

```

---

## 4. System Administrator Role Workflows

### 4.1 Platform Management & Configuration

```mermaid
graph TD
    A[Admin Logs into System] --> B[Access Admin Dashboard]
    B --> C[System Health Check]
    C --> D[Review Platform Metrics]
    D --> E{Admin Task Type}

    E -->|User Management| F[Manage User Accounts]
    E -->|Content Management| G[Manage Platform Content]
    E -->|System Configuration| H[Update System Settings]
    E -->|Monitoring| I[Review System Performance]

    F --> J[User Registration Approvals]
    J --> K[Role Assignments]
    K --> L[Account Permissions]

    G --> M[Educational Content Review]
    M --> N[Blog Post Moderation]
    N --> O[Resource Library Updates]

    H --> P[Payment Gateway Configuration]
    P --> Q[Notification Settings]
    Q --> R[Security Parameters]

    I --> S[Performance Analytics]
    S --> T[Error Log Review]
    T --> U[Security Incident Monitoring]

```

### 4.2 User Support & Issue Resolution

```mermaid
graph TD
    A[User Support Request] --> B[Admin Receives Ticket]
    B --> C[Categorize Issue Type]
    C --> D{Issue Category}

    D -->|Technical| E[Technical Troubleshooting]
    D -->|Account| F[Account Management]
    D -->|Payment| G[Payment Issue Resolution]
    D -->|Verification| H[Verification Process Help]

    E --> I[Diagnose Technical Problem]
    F --> J[Review Account Status]
    G --> K[Check Payment Records]
    H --> L[Review Verification Status]

    I --> M[Implement Technical Fix]
    J --> N[Resolve Account Issue]
    K --> O[Process Payment Resolution]
    L --> P[Assist with Verification]

    M --> Q[Test Fix & Confirm]
    N --> R[Update Account Settings]
    O --> S[Verify Payment Status]
    P --> T[Guide Through Process]

    Q --> U[Notify User of Resolution]
    R --> U
    S --> U
    T --> U

    U --> V[Close Support Ticket]
    V --> W[Update Knowledge Base]

```

---

## 5. Cross-Role Interaction Workflows

### 5.1 Creator-Verifier Communication Workflow

```mermaid
graph TD
    A[Verifier Finds Issue] --> B[Send Message to Creator]
    B --> C[Creator Receives Notification]
    C --> D[Creator Reviews Issue]
    D --> E[Creator Responds with Clarification]
    E --> F[Verifier Reviews Response]
    F --> G{Issue Resolved?}

    G -->|Yes| H[Continue Verification]
    G -->|No| I[Request Additional Information]

    I --> J[Creator Provides More Details]
    J --> K[Multiple Rounds if Needed]
    K --> L[Final Resolution]
    L --> M[Document Communication]
    M --> N[Update Verification Status]

```

### 5.2 Buyer-Creator Direct Communication

```mermaid
graph TD
    A[Buyer Interested in Project] --> B[Click 'Contact Creator']
    B --> C[Send Message to Creator]
    C --> D[Creator Receives Notification]
    D --> E[Creator Reviews Inquiry]
    E --> F[Creator Responds]
    F --> G[Buyer Receives Response]
    G --> H{Satisfied with Response?}

    H -->|Yes| I[Proceed with Purchase]
    H -->|No| J[Ask Follow-up Questions]

    J --> K[Continue Conversation]
    K --> L[Build Trust & Understanding]
    L --> M[Final Purchase Decision]

```

### 5.3 Escalation to Admin Workflow

```mermaid
graph TD
    A[Issue Requires Admin Intervention] --> B[User Escalates to Admin]
    B --> C[Admin Receives Escalation]
    C --> D[Admin Reviews Context]
    D --> E[Admin Investigates]
    E --> F[Admin Makes Decision]
    F --> G[Implement Resolution]
    G --> H[Notify All Parties]
    H --> I[Monitor Resolution Effectiveness]
    I --> J[Update Policies if Needed]

```

---

## 6. Role-Based Permissions Matrix

### 6.1 Access Control by Role

| Feature | Project Creator | Credit Buyer | Verifier | Admin |
| --- | --- | --- | --- | --- |
| ***Project Management*** |  |  |  |  |
| Create Projects | ✅ | ❌ | ❌ | ✅ |
| Submit for Verification | ✅ | ❌ | ❌ | ✅ |
| Edit Own Projects | ✅ | ❌ | ❌ | ✅ |
| View Project Analytics | ✅ | ❌ | ❌ | ✅ |
| ***Verification System*** |  |  |  |  |
| Verify Projects | ❌ | ❌ | ✅ | ✅ |
| Assign Verifiers | ❌ | ❌ | ❌ | ✅ |
| Override Decisions | ❌ | ❌ | ❌ | ✅ |
| ***Trading Marketplace*** |  |  |  |  |
| List Credits | ✅ | ❌ | ❌ | ✅ |
| Purchase Credits | ❌ | ✅ | ✅ | ✅ |
| View Sales Analytics | ✅ | ❌ | ❌ | ✅ |
| ***User Management*** |  |  |  |  |
| Manage Own Profile | ✅ | ✅ | ✅ | ✅ |
| Manage Other Users | ❌ | ❌ | ❌ | ✅ |
| View User Analytics | ❌ | ❌ | ❌ | ✅ |
| ***System Administration*** |  |  |  |  |
| System Configuration | ❌ | ❌ | ❌ | ✅ |
| Content Moderation | ❌ | ❌ | Limited | ✅ |
| Financial Reports | Own Only | Own Only | ❌ | ✅ |

### 6.2 Notification Preferences by Role

| Notification Type | Project Creator | Credit Buyer | Verifier | Admin |
| --- | --- | --- | --- | --- |
| Project Updates | ✅ Mandatory | ✅ Optional | ❌ | ✅ Optional |
| Verification Status | ✅ Mandatory | ❌ | ✅ Mandatory | ✅ Optional |
| Purchase Notifications | ✅ Mandatory | ✅ Mandatory | ❌ | ✅ Optional |
| System Alerts | ✅ Optional | ✅ Optional | ✅ Optional | ✅ Mandatory |
| Educational Content | ✅ Optional | ✅ Optional | ✅ Optional | ✅ Optional |

Each role has distinct workflows optimized for their specific needs and responsibilities within the EcoSprout ecosystem, ensuring efficient operation while maintaining security and compliance standards.