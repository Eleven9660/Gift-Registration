# Gift Registration & Anti-Bribery Compliance System

A React-based web application for tracking gift declarations in compliance with Kenyan anti-bribery regulations (Bribery Act 2016). Built on AWS Amplify.

## Architecture

```mermaid
graph TD
    User[Employee] -->|Auth (Cognito)| WebApp[React App]
    WebApp -->|GraphQL (AppSync)| API[AWS AppSync]
    API -->|Read/Write| DB[(DynamoDB)]
    API -->|Authz| Cognito[Cognito User Pool]
    
    Compliance[Compliance Officer] -->|Review/Audit| WebApp
    
    subgraph AWS Amplify Gen 2
        API
        DB
        Cognito
    end
```

### Tech Stack
- **Frontend**: React (TypeScript), Material UI, Vite
- **Backend**: AWS Amplify Gen 2 (Data, Auth), DynamoDB, Cognito
- **Language**: TypeScript

## Prerequisites
- Node.js v18+
- AWS Account
- AWS Profile configured locally

## Setup & Installation

Since this project was generated in a restricted environment, you must perform the initial installation:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Local Development (with Cloud Sandbox)**:
    This will provision a temporary backend in your AWS account and connect the frontend to it.
    ```bash
    npx ampx sandbox
    ```
    *Keep this terminal running.*

3.  **Start Frontend**:
    In a new terminal:
    ```bash
    npm run dev
    ```

## Deployment

To deploy to a production environment on AWS Amplify:

1.  Push this repository to GitHub.
2.  Log in to the AWS Amplify Console.
3.  "Create new app" -> "GitHub".
4.  Select this repository.
5.  Amplify Gen 2 will automatically detect the `amplify/` directory and build the backend and frontend.

## User Roles & Testing

### Roles
- **Employee**: Can submit declarations and view their own history.
- **Compliance**: Can view all declarations and Approve/Reject them.
- **Admin**: Full access.

### Creating Test Users
To test the "Compliance" features, you need to add a user to the `Compliance` group in Cognito.
You can do this via the AWS Console > Cognito > User Pools > [Your Pool] > Users > [User] > Groups > Add to Group.

## Project Structure
- `amplify/`: Backend definition (Auth, Data/Schema).
- `src/pages/`: Application views (Dashboard, Create Declaration, Review).
- `src/components/`: Reusable UI components.
- `src/client.ts`: Amplify Data client configuration.

## Compliance Features
- **Mandatory Disclosure**: All fields in the declaration form are required.
- **Audit Trail**: All declarations and reviews are stored permanently in DynamoDB.
- **Segregation of Duties**: Employees cannot approve their own gifts (enforced by Role checks).
