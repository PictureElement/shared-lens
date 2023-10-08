# Your App Name

[Description of your app goes here]

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

This React Single Page Application (SPA) is a collective photo album. It allows users to upload and view photos in a gallery-style layout.

## Features

- **Image Upload:**
  Users can upload photos to the gallery. The app supports resizing images before upload for a better user experience.

- **Pagination:**
  The gallery is paginated, displaying a fixed number of items per page to enhance performance and navigation.

- **Facebook In-App Browser Detection:**
  The app detects when it's being viewed in the Facebook in-app browser and provides a message to encourage optimal browser usage.

- **Responsive Design:**
  The app is designed to be responsive, ensuring a consistent user experience across different devices.

- **Loading States:**
  Various loading indicators and states are implemented to enhance user feedback during image processing and loading.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone [repository_url]
    cd [repository_name]
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Run the app locally:

    ```bash
    npm start
    ```

## Usage

1. Access the application at the provided URL or run it locally.
2. Upload your photos by dragging and dropping or selecting them using the file input.
3. Browse the gallery and enjoy the photos.

## Contributing

We welcome contributions! Feel free to fork the repository and submit pull requests to contribute to this project.

## License

[Your License Information Here]

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Project To-do List

1. Paginate results
2. Set maximum number of upload items (client (done) + backend)
3. Image resizing (client (done) + backend)
4. File type check (client + backend)

## Deploy to firebase

`firebase deploy`