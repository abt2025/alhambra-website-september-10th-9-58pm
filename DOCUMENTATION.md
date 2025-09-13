# Technical Documentation

This document provides in-depth technical documentation for the Alhambra Bank & Trust interactive website.

## Component Structure

The main application component is `/src/App.jsx`. This component handles routing, state management, and renders all other components.

- **`/src/CommunicationWidget.jsx`**: This component renders the interactive communication widget, including chat, video call, phone, and social media integration.
- **`/src/multiLanguageContent.js`**: This file contains all multi-language content for the website.
- **`/src/SocialMediaIntegration.jsx`**: This component renders the social media buttons.
- **`/src/StockTicker.jsx`**: This component renders the real-time stock market ticker.
- **`/src/NewsScroller.jsx`**: This component renders the economic news scroller.

## State Management

The application uses React's built-in state management (`useState` and `useContext`) to manage the application state. The main application state is managed in `/src/App.jsx`.

## Multi-Language Implementation

The multi-language implementation is handled by the `useContext` hook and the `multiLanguageContent.js` file. The `App` component provides a `LanguageContext` that allows all child components to access the current language and the corresponding content.

