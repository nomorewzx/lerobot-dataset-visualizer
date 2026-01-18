FROM node:18-slim

# (Optional) Faster Debian mirror
RUN sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list.d/*

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    ca-certificates \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libegl1-mesa \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy LOCAL repo into image
COPY . /lerobot-dataset-visualizer

WORKDIR /lerobot-dataset-visualizer

# Use China npm mirror
RUN npm config set registry https://registry.npmmirror.com

# Reduce retry hangs
RUN npm config set fetch-retries 3 \
 && npm config set fetch-retry-mintimeout 5000 \
 && npm config set fetch-retry-maxtimeout 20000 \
 && npm config set audit false \
 && npm config set fund false

# Disable Tailwind Oxide (but keep lightningcss)
ENV TAILWIND_DISABLE_OXIDE=1

RUN npm install -g pnpm

# Deterministic install
RUN pnpm install --no-frozen-lockfile

# Build Next.js app
RUN pnpm run build

EXPOSE 7860
ENV PORT=7860

CMD ["npm", "start"]

