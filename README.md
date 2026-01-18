# LeRobot Dataset Visualizer

LeRobot Dataset Visualizer is a web application for interactive exploration and visualization of robotics datasets, particularly those in the LeRobot format. It enables users to browse, view, and analyze episodes from large-scale robotics datasets, combining synchronized video playback with rich, interactive data graphs.

## Project Overview

This tool is designed to help robotics researchers and practitioners quickly inspect and understand large, complex datasets. It fetches dataset metadata and episode data (including video and sensor/telemetry data), and provides a unified interface for:

- Navigating between organizations, datasets, and episodes
- Watching episode videos
- Exploring synchronized time-series data with interactive charts
- Paginating through large datasets efficiently

## Key Features

- **Dataset & Episode Navigation:** Quickly jump between organizations, datasets, and episodes using a sidebar and navigation controls.
- **Synchronized Video & Data:** Video playback is synchronized with interactive data graphs for detailed inspection of sensor and control signals.
- **Efficient Data Loading:** Uses parquet and JSON loading for large dataset support, with pagination and chunking.
- **Responsive UI:** Built with React, Next.js, and Tailwind CSS for a fast, modern user experience.

## Technologies Used

- **Next.js** (App Router)
- **React**
- **Recharts** (for data visualization)
- **hyparquet** (for reading Parquet files)
- **Tailwind CSS** (styling)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx` or other files in the `src/` directory. The app supports hot-reloading for rapid development.

### Run with a Local Dataset Server

This app can read datasets from a simple HTTP server. The dataset URL can be either HuggingFace-style (`resolve/main/...`) or a flat directory layout.

1) Serve your dataset directory (flat layout):
```bash
python3 -m http.server 8000 --directory /path/to/datasets
```

Your server should expose:
```
http://localhost:8000/<org>/<dataset>/meta/info.json
http://localhost:8000/<org>/<dataset>/data/...
http://localhost:8000/<org>/<dataset>/videos/...
```

2) Start the visualizer with the local dataset URL:
```bash
DATASET_URL=http://localhost:8000 \
DATASET_URL_LAYOUT=flat \
npm run dev
```

3) Open a dataset episode:
```
http://localhost:3000/<org>/<dataset>/0
```

If you prefer HuggingFace-style paths, mirror your dataset under `resolve/main` and set `DATASET_URL_LAYOUT=hf` (or omit it for auto-detection).

### Docker (Local Dataset)

Build the image from this repo:
```bash
docker build -t lerobot-viz:local .
```

Run it with your local dataset server:
```bash
docker run --network host \
  -e PORT=7860 \
  -e DATASET_URL=http://localhost:8000 \
  -e DATASET_URL_LAYOUT=flat \
  lerobot-viz:local
```

Then open:
```
http://localhost:7860/<org>/<dataset>/0
```

### Environment Variables

- `DATASET_URL`: (optional) Base URL for dataset hosting (defaults to HuggingFace Datasets).
- `DATASET_URL_LAYOUT`: (optional) Dataset URL layout: `hf` for HuggingFace-style `resolve/main`, `flat` for direct paths, or `auto` (default).

## Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or submit a pull request.

### Acknowledgement 
The app was orignally created by [@Mishig25](https://github.com/mishig25) and taken from this PR [#1055](https://github.com/huggingface/lerobot/pull/1055)
