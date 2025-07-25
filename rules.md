
# Pepper Project: Rules & Guidelines

## 1. The Essence of Pepper

**Pepper** is an AI-powered personal assistant designed to streamline the modern job hunt. It's built for savvy job seekers who want to replace tedious, repetitive tasks with intelligent automation.

**Core Mission:** To act as a smart, efficient, and reliable partner that parses job postings, understands them deeply, and helps users tailor their resumes to perfectly match what recruiters and hiring managers are looking for.

**Personality:**
- **Efficient & Precise:** Pepper gets the job done quickly and accurately. The UI is clean, responsive, and focuses on the task at hand.
- **Intelligent:** Leverages the power of the Gemini API for a multi-agent system that analyzes, strategizes, and executes.
- **Sleek & Modern:** The design is dark, professional, and uses high-contrast elements, animations, and blur effects to create a premium user experience.
- **Slightly Sassy:** The taglines and overall feel suggest a confident, capable assistant that's a step ahead.

---

## 2. Core Features Overview

Pepper is a Single Page App (SPA) that combines several powerful features into a cohesive workflow.

### 2.1. AI-Powered Job Parsing & Curation Kick-off
- **Input:** The user pastes a job description and URL into the main form.
- **AI Parsing:** The Gemini API (`gemini-2.5-flash`) extracts key details into a structured, editable JSON format.
- **Action:** The primary action is **"Resume Tailoring,"** which sends the parsed job data and a selected user resume to the backend to initiate the main curation pipeline.

### 2.2. The Multi-Step Curation Pipeline
This is the core of Pepper's intelligence, visible within the Request Dashboard for any "Resume Tailoring" task.
- **Agent 2 (Resume Feedback):** Provides an initial high-level analysis of the base resume.
- **Agent 3 (Recruiter POV):** Analyzes the job to identify "must-haves," "good-to-haves," and ATS keywords.
- **Agent 4 (Resume Coach):** Generates specific, actionable JSON-based editing instructions for each section of the resume.
- **User Fine-Tuning:** Before final approval, the user can directly edit the generated JSON instructions and add custom text notes to guide the final agent.
- **Approval & Finalization (Agent 5):** Upon approval, a final agent executes the instructions to create the tailored `.docx` resume, which becomes available for download.

### 2.3. Request Dashboard
- **Purpose:** A slide-down panel providing a real-time view of all asynchronous backend tasks (like resume curation).
- **Functionality:** Users can track the status of each request (`Finished`, `Pending`, `Queued`). Clicking a request expands it to show the detailed multi-agent pipeline and its progress, allowing access to the output of each agent.

### 2.4. Resume Management (FAB & Resume Center)
- **Floating Action Button (FAB):** A persistent UI element for quick access to resume actions.
- **Resume Center:** A full-screen panel serving as the central library for all user resumes.
    - **Organization:** Resumes are separated into "Default" (user-uploaded base versions) and "Curated" (AI-generated versions) tabs.
    - **Status:** A visual indicator shows whether a resume has been successfully reviewed by the AI.
    - **Actions:** Users can upload, re-upload (update), rename, and download resumes.

### 2.5. Authentication & Configuration
- **Configuration:** A modal allows the user to set their backend API URL, which is saved in `localStorage`.
- **Login:** If an API URL is set, the app provides a secure, PIN-based login system for registered users, with the session stored locally.

---

## 3. Design System & UI/UX Principles

Pepper's UI is built on a consistent and modern design system.

### 3.1. Color Palette

-   **Primary:** `#35A2A2` (Teal). Used for primary buttons, links, focus rings, and branding accents.
-   **Dark Primary:** `#2E8B8B`. Used for hover states on primary elements.
-   **Background:** `#020617` (`slate-950`). A deep, near-black slate that makes other colors pop.
-   **UI Surfaces:** `#1E293B` (`slate-800`) and `#0F172A` (`slate-900`). Used for cards, modals, and input backgrounds.
-   **Text & Borders:**
    -   `silver-light` (`#E2E8F0`): For main text.
    -   `silver-medium` (`#94A3B8`): For secondary text and icons.
    -   `slate-700` / `slate-800`: For borders and dividers.
-   **Feedback Colors:**
    -   **Success:** Green (e.g., `bg-green-500/10`, `text-green-300`).
    -   **Error:** Red (e.g., `bg-red-500/10`, `text-red-300`).
    -   **Warning:** Yellow (e.g., `bg-yellow-500/10`, `text-yellow-300`).

### 3.2. Typography

-   **Logo:** `Exo 2`, bold, italic, uppercase. Creates a distinct, high-tech identity.
-   **UI:** System `sans-serif`. Clean, legible, and modern.
-   **Code/JSON:** System `monospace`. Used in the JSON editor for clarity and alignment.

### 3.3. Layout & Spacing

-   **Container:** The main content is constrained to a `max-w-4xl` container with responsive padding.
-   **Modularity:** The UI is composed of highly modular components (cards, modals, forms) with consistent internal padding (`p-6` or `p-8`) and rounded corners (`rounded-xl` or `rounded-2xl`).
-   **Hierarchy:** Visual hierarchy is established through font size/weight, color contrast, and component elevation (shadows).

### 3.4. Micro-interactions & Animations

-   **Loading States:** The `AnimatedLogo` glows with a `fluid-glow` animation during processing. `LoadingSpinner` icons are used inside buttons and panels to indicate activity.
-   **Transitions:** Modals and panels use smooth `transform` and `opacity` transitions. Buttons and links have `transition-colors` for fluid hover states.
-   **User Guidance:** Subtle animations like `animate-pull-hint` gently guide the user to discover features like the Request Dashboard.
-   **FAB Animation:** The FAB icon smoothly transforms from a document to an 'X' when activated, providing clear state feedback.

### 3.5. Advanced UI Technique: The Fluid "Goo" Animation

The "gooey" or "liquid" effect seen on the user profile logout and checkpoint approval buttons is a signature micro-interaction in Pepper. It creates a visually engaging and satisfying experience by making separate UI elements appear to merge and split like a fluid. This effect is achieved through a clever combination of a specific SVG filter and standard CSS transitions.

#### A. The Core Concept: An SVG Filter

The entire effect is powered by an SVG filter defined once in `index.html`. This filter is applied via CSS to a container element, and it processes all of the container's children to create the effect.

```html
<!-- Defined in index.html -->
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="goo">
      <!-- Step 1: Blur all child elements heavily -->
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
      
      <!-- Step 2: Increase alpha contrast to create sharp edges -->
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
      
      <!-- Step 3: (Optional but recommended) Blend the original graphic back on top -->
      <feBlend in="SourceGraphic" in2="goo" />
    </filter>
  </defs>
</svg>
```

**Filter Breakdown:**

1.  **`<feGaussianBlur>`**: This is the first and most crucial step. It takes the source graphic (all elements within the filtered container) and applies a significant blur. The `stdDeviation` attribute controls the amount of blur. When two blurred elements move close to each other, their blurred pixels overlap and blend, creating a single, larger, fuzzy shape.

2.  **`<feColorMatrix>`**: This is the magic ingredient. It performs a color transformation on the result of the blur. The specific matrix values `... 18 -7` are designed to manipulate the **alpha (transparency) channel** of the blurred image. In simple terms, it creates extreme contrast:
    *   Pixels that are mostly transparent are made *fully* transparent.
    *   Pixels that are even slightly opaque are made *fully* opaque.
    *   This has the effect of "crushing" the fuzzy, anti-aliased edges of the blurred shape, resulting in a single, merged blob with a sharp, well-defined outline.

3.  **`<feBlend>`**: This final step is an enhancement. It takes the original, non-filtered `SourceGraphic` and blends it back on top of the "gooey" shape. This restores the original color and sharpness to the elements themselves, ensuring they don't look blurry while still benefiting from the merged-blob effect at their boundaries.

#### B. The CSS & Component Implementation

To use the filter, a specific HTML structure and corresponding CSS are required.

1.  **The Container:** A parent element must wrap all the elements that will participate in the effect. This container is given the `filter-goo` class, which applies the SVG filter via CSS:
    ```css
    .filter-goo {
      filter: url(#goo);
    }
    ```

2.  **Element Positioning & Animation:**
    *   A central, always-visible element (e.g., the profile circle) acts as the anchor.
    *   One or more secondary elements (e.g., the logout button) are positioned absolutely, directly overlapping the central element.
    *   Initially, these secondary elements are hidden (e.g., `opacity-0`).
    *   Using Tailwind's `group` utility, a `group-hover` state on the container triggers CSS transitions on the secondary elements.
    *   The transition animates the secondary element's `opacity` to 1 and its position (`left`, `transform`, etc.) to move it outwards from the center. An `ease-out` easing function provides a more natural feel.

**Example TSX Structure:**
```tsx
// Simplified example from Header.tsx
<div className="group relative flex items-center filter-goo">

    {/* Secondary Element: Starts hidden and centered, moves out on hover */}
    <button
        className="absolute left-1/2 ... opacity-0 group-hover:opacity-100 group-hover:left-[calc(50%+3rem)] transition-all duration-300 ease-out"
        aria-label="Logout"
    >
        <XIcon />
    </button>
    
    {/* Central Element: Always visible */}
    <div 
        className="relative z-10 w-12 h-12 ... cursor-pointer"
    >
        P
    </div>
</div>
```

#### C. Synthesizing the Effect: A Step-by-Step Flow

1.  **Initial State:** The central circle is visible. The logout button is invisible (`opacity-0`) and stacked at the same position. The `filter: url(#goo)` is active on the container but has no visible effect as only one shape is present.
2.  **Hover On:** The user moves their cursor over the container (`<div class="group...">`).
3.  **Animation Begins:** The CSS transition on the logout button is triggered. It starts fading in (`opacity: 0 -> 1`) and moving sideways (`left: 50% -> calc(...)`).
4.  **The "Goo" Forms:** On every single frame of the animation, the SVG filter re-evaluates:
    *   The `feGaussianBlur` blurs both the central circle and the moving logout button. As the logout button is still partially overlapping the circle, their blurs merge into a single, stretched, pill-like fuzzy shape.
    *   The `feColorMatrix` immediately sharpens the outline of this fuzzy shape. This creates the illusion that the central circle is a liquid that is being "pulled" outwards, stretching and thinning in the middle.
5.  **Animation Ends:** The logout button reaches its final position, fully separated from the central circle. The filter now treats them as two distinct shapes, as their blurs no longer overlap.
6.  **Hover Off:** The CSS transition reverses, and the logout button animates back to the center and fades out. The "goo" effect happens in reverse, appearing as if the smaller blob is being re-absorbed into the larger one.

---

## 4. Code Architecture & Best Practices

### 4.1. Project Structure

```
/
├── components/      # Reusable React components
├── constants/       # App-wide constants (e.g., taglines)
├── services/        # API interaction logic (Gemini, backend)
├── App.tsx          # Main application component
├── index.tsx        # React root entry point
├── types.ts         # Shared TypeScript interfaces
├── index.html       # Main HTML file with Tailwind config
└── metadata.json    # Project metadata
```

### 4.2. Key Principles

-   **Component-Driven:** Build the UI from small, single-purpose components.
-   **Separation of Concerns:**
    -   `components/` are for UI and local state.
    -   `services/` handle all external communication and business logic, returning typed data or throwing errors. This keeps components clean.
-   **TypeScript Everywhere:** Use explicit types for props, state, and API responses (`types.ts`). This ensures type safety and improves developer experience.
-   **State Management:**
    -   Use `useState` for simple, local component state.
    -   Use `useEffect` for lifecycle events like fetching initial data.
    -   Use `useCallback` to memoize functions passed to child components to prevent unnecessary re-renders.
    -   Use `localStorage` ONLY for persisting user session and configuration across browser reloads.
-   **Error Handling:**
    -   Service functions should handle API errors and throw a consistent `Error` object.
    -   Components should `try...catch` calls to service functions and set an error state to display a user-friendly message in the UI.
-   **Accessibility:**
    -   Use semantic HTML.
    -   Provide `aria-*` attributes for interactive elements (e.g., `aria-label`, `aria-expanded`, `role`).
    -   Ensure all interactive elements have clear focus states (`focus:ring-primary`).
-   **API Keys:** The Gemini API key **MUST** be loaded from `process.env.API_KEY`. It should never be hardcoded or exposed in the client-side code.
