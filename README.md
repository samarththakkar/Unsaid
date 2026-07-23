# AI-Readable UX/UI Bug Detector

A drop-in widget that watches how users interact with a web app, detects UI/UX problems automatically, and turns them into structured bug reports developers can paste straight into an AI coding tool (Cursor, Claude, ChatGPT) to get a real fix.

## Architecture

The project is divided into three main components:

1. **Tracker (`tracker/`)**
   - A vanilla JS widget (<15kb gzipped) that embeds into host projects.
   - Responsible for client-side event detection (rage clicks, dead clicks, form abandonment, layout shifts, overflow, JS errors).
   - Utilizes Shadow DOM to prevent CSS leakage.

2. **Server (`server/`)**
   - Express + MongoDB Atlas backend.
   - Ingests events batched from the tracker.
   - Contains a cron job that periodically processes events and uses an LLM (Claude API) to generate structured QA-style bug reports.

3. **Dashboard (`dashboard/`)**
   - React + Tailwind web interface for developers.
   - Allows users to manage sites, generate API keys, and view historical insights over time.

## Quick Start (WIP)

More instructions to come as the modules are developed.
