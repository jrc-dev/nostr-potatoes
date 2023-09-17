# Nostr Potatoes - Decentralized Movie and Series Review Aggregator 🎬🍿🥔

![Build](https://github.com/stremio/stremio-web/workflows/Build/badge.svg?branch=development)
[![Github Page](https://img.shields.io/website?down_message=offline&label=Page&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iOTgiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00OC44NTQgMEMyMS44MzkgMCAwIDIyIDAgNDkuMjE3YzAgMjEuNzU2IDEzLjk5MyA0MC4xNzIgMzMuNDA1IDQ2LjY5IDIuNDI3LjQ5IDMuMzE2LTEuMDU5IDMuMzE2LTIuMzYyIDAtMS4xNDEtLjA4LTUuMDUyLS4wOC05LjEyNy0xMy41OSAyLjkzNC0xNi40Mi01Ljg2Ny0xNi40Mi01Ljg2Ny0yLjE4NC01LjcwNC01LjQyLTcuMTctNS40Mi03LjE3LTQuNDQ4LTMuMDE1LjMyNC0zLjAxNS4zMjQtMy4wMTUgNC45MzQuMzI2IDcuNTIzIDUuMDUyIDcuNTIzIDUuMDUyIDQuMzY3IDcuNDk2IDExLjQwNCA1LjM3OCAxNC4yMzUgNC4wNzQuNDA0LTMuMTc4IDEuNjk5LTUuMzc4IDMuMDc0LTYuNi0xMC44MzktMS4xNDEtMjIuMjQzLTUuMzc4LTIyLjI0My0yNC4yODMgMC01LjM3OCAxLjk0LTkuNzc4IDUuMDE0LTEzLjItLjQ4NS0xLjIyMi0yLjE4NC02LjI3NS40ODYtMTMuMDM4IDAgMCA0LjEyNS0xLjMwNCAxMy40MjYgNS4wNTJhNDYuOTcgNDYuOTcgMCAwIDEgMTIuMjE0LTEuNjNjNC4xMjUgMCA4LjMzLjU3MSAxMi4yMTMgMS42MyA5LjMwMi02LjM1NiAxMy40MjctNS4wNTIgMTMuNDI3LTUuMDUyIDIuNjcgNi43NjMuOTcgMTEuODE2LjQ4NSAxMy4wMzggMy4xNTUgMy40MjIgNS4wMTUgNy44MjIgNS4wMTUgMTMuMiAwIDE4LjkwNS0xMS40MDQgMjMuMDYtMjIuMzI0IDI0LjI4MyAxLjc4IDEuNTQ4IDMuMzE2IDQuNDgxIDMuMzE2IDkuMTI2IDAgNi42LS4wOCAxMS44OTctLjA4IDEzLjUyNiAwIDEuMzA0Ljg5IDIuODUzIDMuMzE2IDIuMzY0IDE5LjQxMi02LjUyIDMzLjQwNS0yNC45MzUgMzMuNDA1LTQ2LjY5MUM5Ny43MDcgMjIgNzUuNzg4IDAgNDguODU0IDB6IiBmaWxsPSIjZmZmIi8%2BPC9zdmc%2B&up_message=online&url=https%3A%2F%2Fstremio.github.io%2Fstremio-web%2F)](https://stremio.github.io/stremio-web/)

**Nostr Potatoes** is a unique client movie and series review aggregator that empowers users to curate and discover reviews based on the preferences of people they follow. Distinguishing itself from traditional and centralized platforms like IMDB and Rotten Tomatoes, Nostr Potatoes is built on the [**Nostr Protocol**](https://github.com/nostr-protocol/nostr), a decentralized open protocol,censorship-resistant global "social" network. This approach enhances trustworthiness and aligns reviews more closely with your personal preferences and values.

## Key Features

- **Decentralization:** Operates on the Nostr Protocol, ensuring that no central authority controls the content or reviews. Decentralization fosters real diversity and independence.

- **User-Powered Ratings:** Your ratings and preferences matter. Nostr Potatoes relies on the collective wisdom of users you follow, allowing you to discover content that resonates with your unique taste.

- **Enhanced Trust:** By basing recommendations on the ratings of people in your network, Nostr Potatoes aims to create a more trustworthy platform where you can confidently explore movies and series.

- **Community-Driven:** Join a community of like-minded individuals passionate about freedom, tech, film and television. Engage in discussions, contribute reviews, and connect with others who share your interests.


## Why ?

In the world of entertainment, reviews can be a battleground for differing opinions and cultural narratives. It's not uncommon to encounter instances where movies and series become embroiled in what's often referred to as the "cultural war," where diverse perspectives clash.

**Corporate interests** often play a significant role in shaping the perception of movies and series. Some companies may attempt to influence reviews to promote their content or downplay negative feedback. Understanding these dynamics can help users make informed choices.

**Critics and reviewers** also carry significant weight in shaping public opinion. While many critics offer thoughtful, unbiased analysis, some may have **ideological or biased motivations** that influence their reviews. It's essential to approach reviews with a critical eye and consider multiple viewpoints.


## Build

### Prerequisites

* Node.js 12 or higher
* npm 6 or higher

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm start
```

### Production build

```bash
npm run build
```

## Screenshots

### Board

![Board](/screenshots/board.png)

### Discover

![Discover](/screenshots/discover.png)

### Meta Details

![Meta Details](/screenshots/metadetails.png)


## License

Nostr Potatoes code is available under GPLv2 license. See the [LICENSE](/LICENSE.md) file in the project for more information.

## Features to Implement

Here's a list of features and improvements we plan to implement in future updates:

- [ ] **Cache:** Today we do all searches directly on the relays, this is extremely inefficient and we know it. We will have our own server for caching.

- [ ] **Reviews Main Page:** Having cache, it will be possible to view the rates on the main page.

- [ ] **Critics:** Users can personalize their experience by selecting a list of critics based on who they follow. This groundbreaking feature allows users to curate their reviews based on individuals/influencers whose opinions and tastes align with their own.
