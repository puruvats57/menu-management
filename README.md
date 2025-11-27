# Digital Menu Management System

A comprehensive Digital Menu Management System for restaurants built with the T3 Stack. This platform allows restaurant owners to efficiently manage their menus and enables customers to view them digitally through QR codes or shared links.

## Technology Stack

- **T3 Stack** - Next.js, tRPC, Prisma, TypeScript
- **Prisma** - ORM for database management
- **PostgreSQL** - Database (hosted on Neon)
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Resend** - Email service for verification codes
- **QRCode** - QR code generation


```

3. **Set up the database:**

```bash
# Generate Prisma client
npm run postinstall

# Run migrations
npm run db:push
```

4. **Start the development server:**

```bash
npm run dev
```



## Development Approach & Tools

### Approach to Solving the Problem

The assignment was approached systematically, breaking down the requirements into manageable components:

1. **Planning & Architecture:**
   - Analyzed the requirements and UI reference images to understand the scope
   - Designed the database schema to support restaurants, categories, and dishes with many-to-many relationships
   - Chose T3 Stack for type-safe, full-stack development with Next.js, tRPC, and Prisma

2. **Development Phases:**
   - **Phase 1 - Core Setup:** Set up authentication, database schema, and basic CRUD operations
   - **Phase 2 - Menu Management:** Implemented category and dish management with image upload functionality
   - **Phase 3 - Public Menu View:** Built the customer-facing menu with sticky headers, category navigation, and responsive design
   - **Phase 4 - UI Refinement:** Matched the design to reference images, implemented circular images, grid layouts, and floating menu button

3. **Problem-Solving Strategy:**
   - Started with backend API routes (tRPC) to ensure data integrity and validation
   - Built UI components incrementally, testing each feature before moving to the next
   - Used TypeScript for type safety and caught errors early in development
   - Implemented responsive design using Tailwind CSS with mobile-first approach
   - Added scroll tracking and sticky headers for better UX in the public menu view

4. **Key Challenges Addressed:**
   - **Image Handling:** Implemented file upload with base64 encoding as a quick solution, with plans for proper cloud storage
   - **Responsive Layout:** Used CSS Grid with breakpoints to ensure cards wrap properly on all screen sizes
   - **Scroll Synchronization:** Implemented scroll position tracking to update active category and sticky header
   - **Data Relationships:** Managed many-to-many relationships between dishes and categories using Prisma

5. **Testing & Iteration:**
   - Tested each feature manually across different screen sizes
   - Refined UI to match reference images through multiple iterations
   - Handled edge cases like empty categories, missing images, and optional fields

### IDE Used
- **VS Code** - Primary development environment with extensions for TypeScript, Tailwind CSS, and Prisma

### AI Tools Used
- **ChatGPT** - Used for code generation, debugging, and architectural guidance throughout the development process

### AI Prompts Used

AI was used for targeted assistance on specific implementation details:

1. **Technical Clarifications:**
   - "How to convert file input to base64 in React?"
   - "Best approach for sticky header positioning with multiple fixed elements?"
   - "CSS Grid responsive layout pattern for wrapping cards"

2. **UI Refinements:**
   - "How to make images circular with proper aspect ratio in Tailwind CSS?"
   - "Scroll position tracking for updating active category in React"

3. **Debugging:**
   - "TypeScript error with optional chaining in Prisma queries"
   - "Fix z-index stacking issues with multiple sticky headers"

### AI Tool Effectiveness

**How Helpful:**
- Very helpful for rapid prototyping and generating boilerplate code
- Excellent at suggesting best practices for React/Next.js patterns
- Good at understanding UI requirements from descriptions
- Helpful for debugging TypeScript and Prisma schema issues

**Mistakes Identified and Corrected:**
1. **Initial Image Implementation:** AI initially suggested URL-only input, but we needed file upload capability. Corrected by adding file input with base64 conversion.
2. **Layout Issues:** AI suggested vertical layouts initially, but screenshots showed horizontal grid. Corrected to use CSS Grid with responsive columns.
3. **Sticky Header Positioning:** Initial calculations for sticky header offsets were incorrect. Manually adjusted based on actual header heights.
4. **Image Preview:** AI suggested square previews, but final design required circular images. Updated to match design.
5. **Scroll Tracking:** Initial scroll detection logic had timing issues. Refined with proper offset calculations.

### Edge Cases & Error Scenarios Handled

1. **Image Upload:**
   - File type validation (only images allowed)
   - File size validation (max 5MB)
   - Fallback to URL input if file upload fails
   - Base64 encoding for client-side image storage
   - Handling both base64 and URL image formats

2. **Category Management:**
   - Empty categories (no dishes) - hidden from display
   - Categories with no dishes show "0 dishes"
   - Deleting categories removes dish associations (cascade delete)

3. **Dish Management:**
   - Dishes without images display correctly (no broken image icons)
   - Optional fields (description, spice level, price) handled gracefully
   - Multiple category assignments per dish
   - Circular images maintain aspect ratio

4. **Public Menu View:**
   - Scroll position tracking for sticky category name
   - Smooth scrolling to categories
   - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
   - Empty state handling when no dishes exist

5. **Authentication:**
   - Email verification code expiration
   - Session management
   - Protected routes for dashboard

6. **Data Validation:**
   - Input sanitization on client and server
   - Type checking with TypeScript
   - Zod schema validation for API inputs

### Edge Cases Not Handled (Due to Time Constraints)

1. **Image Storage:**
   - **Issue:** Base64 images stored directly in database can become very large
   - **Solution:** Implement proper image upload service (Cloudinary/S3) with:
     - Image compression before storage
     - CDN delivery for faster loading
     - Automatic image optimization
     - Thumbnail generation

2. **Error Handling:**
   - **Issue:** Limited error messages for users
   - **Solution:** Add comprehensive error boundaries and user-friendly error messages:
     - Network error handling
     - Form validation error messages
     - Toast notifications for success/error states

3. **Performance:**
   - **Issue:** Large menus may load slowly
   - **Solution:** Implement:
     - Pagination or infinite scroll for dishes
     - Image lazy loading
     - Virtual scrolling for long lists
     - Database query optimization with indexes

4. **Accessibility:**
   - **Issue:** Limited ARIA labels and keyboard navigation
   - **Solution:** Add:
     - Proper ARIA labels for screen readers
     - Keyboard navigation support
     - Focus management
     - Color contrast improvements

5. **Mobile Experience:**
   - **Issue:** Some interactions may not be optimized for mobile
   - **Solution:** Enhance:
     - Touch gestures for navigation
     - Mobile-specific menu layouts
     - Swipe actions for cards

6. **Data Integrity:**
   - **Issue:** No soft deletes or audit trails
   - **Solution:** Add:
     - Soft delete functionality
     - Activity logs
     - Version history for menu changes

7. **Image Validation:**
   - **Issue:** Limited image format and dimension validation
   - **Solution:** Add:
     - Image dimension validation (min/max width/height)
     - Format conversion (convert to WebP for better compression)
     - Malicious file detection

8. **Offline Support:**
   - **Issue:** No offline functionality
   - **Solution:** Implement:
     - Service workers for offline caching
     - Local storage for menu data
     - Offline-first architecture

## License

MIT
