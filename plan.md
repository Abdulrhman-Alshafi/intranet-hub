# Copilot Implementation Plan — Embed iTop Ticket System Inside SharePoint IT Support Page

## Goal

Integrate the existing iTop portal into the SharePoint Online IT Support page using a custom SPFx React web part.

The final experience should:

* Feel fully native to SharePoint
* Open the iTop ticket portal inside a large modern popover/modal
* Use custom SharePoint-aligned styling
* Support responsive layouts
* Support future SSO integration
* Keep iTop running externally while SharePoint acts as the main portal UI

Existing iTop portal URL:

```text
https://itop.optimumpartners.co/pages/exec.php?exec_module=itop-portal-base&exec_page=index.php&portal_id=itop-portal
```

---

# Architecture

```text
SharePoint Online
    ↓
IT Support Page
    ↓
SPFx React Web Part
    ↓
Custom Ticket Button
    ↓
Large Modal / Popover
    ↓
Embedded iTop Portal (iframe)
```

---

# Main Objective

Add a new "Open IT Ticket System" experience inside the existing IT Support page.

When the user clicks the button:

* A fullscreen or large modal/popover opens
* The iTop portal loads inside an iframe
* The UI matches SharePoint styling
* The experience feels native and modern

---

# Technical Requirements

## Stack

* SharePoint Online
* SPFx
* React
* TypeScript
* Fluent UI
* iframe embedding
* Responsive CSS

---

# Phase 1 — Environment Setup

## Tasks

### Install Required Tools

```bash
npm install -g yo gulp @microsoft/generator-sharepoint
```

---

### Create SPFx Project

```bash
yo @microsoft/sharepoint
```

Configuration:

* Solution Name: `it-support-portal`
* Framework: React
* Component Type: WebPart
* Environment: SharePoint Online only

---

# Phase 2 — Create IT Support Ticket Web Part

## Goal

Create a modern SPFx React web part that:

* Adds a ticket system button
* Opens a large modal
* Embeds iTop

---



---

# Phase 3 — Add Ticket Button

## UI Requirements

Add a modern card/button section inside the IT Support page.

### Button Text

```text
Open IT Ticket System
```

---

## Button Style

the same as the other buttons

---

# Phase 4 — Create Large Modal / Popover

## Goal

the same that we have for defrant component but bager 

---

# Modal Requirements

## Desktop


## Mobile

* Fullscreen

---

# Modal Features

* Close button
* Loading spinner
* Smooth transitions
* Responsive scaling
* Background overlay
* Prevent page scrolling while open

---

# Phase 5 — Embed iTop Portal

## Add iframe

Embed the existing iTop portal:

```text
https://itop.optimumpartners.co/pages/exec.php?exec_module=itop-portal-base&exec_page=index.php&portal_id=itop-portal
```

---

## iframe Requirements

* Width: 100%
* Height: 100%
* No borders
* Responsive resizing
* Rounded corners
* White background

---

# iframe Security Handling

## Verify

Check whether:

* X-Frame-Options blocks embedding
* CSP blocks embedding

If blocked:

* Update server configuration
* Allow SharePoint domain in frame-ancestors

---

# Phase 6 — Native SharePoint Styling

## Objective

Make the experience look fully integrated into SharePoint.

---

# Styling Requirements

## Use Fluent UI

Install:

```bash
npm install @fluentui/react
```

---

## Visual Requirements

* SharePoint-like typography
* Soft shadows
* Rounded corners
* Smooth hover effects
* Theme-aware colors
* Modern enterprise UI

---

# Phase 7 — Loading Experience

## Add Loading Overlay

While iframe loads:

* Show spinner
* Show "Loading Ticket System..."
* Fade in iframe after load

---

# Phase 8 — Responsive Behavior

## Desktop

* Large centered modal

## Tablet

* Nearly fullscreen

## Mobile

* Fullscreen responsive mode

---

# Phase 9 — Future Authentication Support

for now just login 
 
Expected future flow:

```text
User logs into Microsoft 365
        ↓
SharePoint authenticates
        ↓
iTop automatically authenticates
```

---

# Phase 10 — Optional Native Enhancements

## Add Optional Features

### Header Bar

Inside modal:

* IT Support title
* User info
* Quick actions

---

### Quick Actions

Possible additions:

* Create ticket
* My tickets
* Knowledge base
* Emergency support

---

### AI Integration Placeholder

Prepare future AI section:

* AI ticket summaries
* Smart recommendations
* Ticket search

---

# Phase 11 — Performance Requirements

## Requirements

* Lazy load iframe only after modal opens
* Avoid rendering iframe on initial page load
* Minimize SPFx bundle size
* Use React hooks
* Prevent unnecessary rerenders

---

# Phase 12 — Accessibility

## Requirements

* Keyboard navigation
* ESC closes modal
* Focus trapping
* Screen reader compatibility
* Proper ARIA labels

---

# Phase 13 — Deployment

## Build

```bash
gulp bundle --ship
gulp package-solution --ship
```

---

## Deploy

Upload `.sppkg` package into:

```text
SharePoint App Catalog
```

---

## Add To Site

* Add web part to IT Support page
* Configure full-width section
* Verify responsive behavior

---

# Expected Final UX

## User Flow

```text
User opens SharePoint
        ↓
Opens IT Support page
        ↓
Clicks "Open IT Ticket System"
        ↓
Large modern modal opens
        ↓
iTop loads seamlessly
        ↓
User interacts without leaving SharePoint
```

---

# Important Notes For Copilot

## DO NOT

* Reload the entire SharePoint page
* Open iTop in a new tab
* Use default SharePoint iframe embed only
* Use old Fabric UI patterns
* Hardcode tenant-specific styling

---

# MUST HAVE

* Modern React architecture
* Fluent UI
* Responsive modal
* Smooth transitions
* Native SharePoint feel
* Clean TypeScript structure
* Maintainable component separation

---

# Stretch Goals

## Future Enhancements

* Teams integration
* Notification badges
* Ticket counters
* REST API integration
* Native dashboards
* AI assistant
* Dark mode support
* Custom SharePoint theming

---

# Final Deliverable

A production-ready SPFx React web part integrated into the IT Support page that launches the external iTop portal in a modern SharePoint-native modal experience.
