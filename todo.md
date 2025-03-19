# Project Transformation Work Plan

## Bugs discovered
- [x] aspect ratio is not being respected by the UI (potentially a bug with UI or backend)
- [x] bulk download is not working, should pivot to a zip download
- [x] flickering when processing images, 2 images being uploaded lead to each image being re-loaded 3 times

## Phase 1: Project Structure and Backend Migration
- [x] Create backend directory and move existing Python code
- [x] Update backend dependencies (migrated to pyproject.toml with UV)
- [x] Create FastAPI application structure
- [x] Implement image processing endpoint with async support
- [x] Add Docker configuration for backend with UV support
- [x] Test backend API independently
  - [x] Set up pytest with fixtures
  - [x] Create API test cases
  - [x] Run and verify tests
  - [x] Fix any issues found during testing
    - [x] Added comprehensive unit tests for ImageProcessor
    - [x] Improved error handling with custom exceptions
    - [x] Fixed face detection array handling
    - [x] Added proper input validation

## Phase 2: Frontend Setup
- [x] Set up Next.js 14 project with TypeScript
- [x] Install and configure ShadCN/UI
- [x] Create basic project structure (pages, components, etc.)
- [x] Set up API client utilities
  - [x] Configure OpenAPI client generation
  - [x] Set up environment-based API configuration
  - [x] Implement proper response handling for binary data

## Phase 3: Frontend Implementation
- [x] Create main layout with split view (upload/results)
- [x] Implement drag-and-drop upload zone
- [x] Add upload progress indicators
- [x] Implement image preview grid
- [x] Add download functionality ~with progress~
  - [x] Single image download
  - [x] Bulk download with ZIP
- [x] Implement error handling and user feedback
  - [x] Toast notifications for errors
  - [x] Loading states during processing
- [x] Add loading states and animations

## Supabase integration, login & user accounts

- [ ] Integration with supabase for logging in users with Google & Email
- [ ] Tracking user credit count in supabase (using API)
- [ ] Logout button
- [ ] User settings page (using API)
- [ ] show credits count to user

## Stripe integration, payments, credits
- [ ] enable user to purchase credits using stripe
- [ ] update credit count when user purchases credits in DB
- [ ] update credit count when user uses tool by decrementing for each image processed in  DB
- [ ] add validation to check if user has enough credits before processing, return helpful error message
- [ ] add toast notification to user when they are nearing their credit limit

## Phase 6: Integration and Testing
- [ ] Test end-to-end flow with multiple images
- [ ] Optimize performance and UX
  - [ ] Implement proper blob URL cleanup
  - [ ] Add retry logic for failed requests
  - [ ] Optimize memory usage for large batches
- [ ] Add final polish and documentation
- [ ] Test cross-browser compatibility

## Current Focus:
→ Implementing proper blob URL management and fixing aspect ratio issues 