## Credits System Integration, next steps

A few notes from the developer that started working on the credits features.

### Backend Tasks
- [ ] Create credits table in database to track user credits
- [ ] Implement GET /api/credits endpoint to return user's current credit balance
- [ ] Implement POST /api/credits/deduct endpoint to deduct credits when processing images
- [ ] Add credits validation middleware to prevent processing if user has insufficient credits
- [ ] Implement credits purchase system integration with payment provider

### Frontend Tasks
- [ ] Replace dummy fetchCredits function in credits-counter.tsx with actual API call
- [ ] Add credits deduction handling in image processing workflow
- [ ] Implement error handling for insufficient credits
- [ ] Add visual feedback when credits are deducted
- [ ] Create credits purchase flow UI
- [ ] Add credits history view

### Testing
- [ ] Add unit tests for credits API endpoints
- [ ] Add integration tests for credits system
- [ ] Test error scenarios (insufficient credits, API failures)
- [ ] Test concurrent credit deductions 