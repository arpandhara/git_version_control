## Global Navigation Bar Implementation

**Objective:** Build a global, transparent navigation bar with floating white icons that persists across all application pages.

### 1. Layout & Structure
*   **Container Style:** The navbar must have a completely transparent background (`bg-transparent`) with a flexbox layout separating the left and right sections.
*   **Color Theme:** All typography, borders, and icons must be rendered in pure white.
*   **Left Section Components:** 
    *   Hamburger Menu (Use asset: `MenuV4`).
    *   Username text display.
    *   *Strict Constraint: Do not include any brand logos.*
*   **Right Section (Floating Icons):**
    *   Search trigger/bar (Use asset: `Search to X`).
    *   Add/Create action (Use asset: `Plus to X`).
    *   Pull Request standard icon.
    *   Repositories bookmark (Use asset: `Folder`).
    *   Alerts/Notifications (Use asset: `Notification V3`).
    *   User Profile Picture.

### 2. Profile Picture & Data Integration
*   **Cloudinary Integration:** Fetch and render the user's profile picture directly via the Cloudinary API.
*   **Environment Fallback:** If the user has not uploaded a profile picture, strictly fallback to the default avatar URL defined in the environment variables (e.g., `import.meta.env.VITE_DEFAULT_PFP_URL` or `process.env.DEFAULT_PFP_URL`).
*   **Image Styling:** The profile picture should be a perfectly rounded avatar (`rounded-full`) with a unified height and width.

### 3. Technical Requirements
*   **Layout Persistence:** Integrate this navbar component into the root layout wrapper to ensure it renders consistently across all routes without unmounting.
*   **Floating Effect:** Apply subtle floating CSS effects to the right-side icons (e.g., utilizing drop shadows or slight hover transformations) to detach them visually from the transparent background.