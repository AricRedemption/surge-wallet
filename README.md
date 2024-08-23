# Surge Wallet

## About Surge

## This is a multi-sig wallet on Bitcoin by using Rooch network L2 solution

## Overview

Architecture:
![architecture](public/architecture/architecture.png)

Operation workflow:
![Operation workflow](public/architecture/workflow.png)

## DEV Mode

### 1. Install

```shell
pnpm install
```

### 2. Start

```shell
pnpm dev
```

### 3. Build

```shell
pnpm build
```

## Run in blocklet

### 1. Start blocklet server

```shell
cd ~/blocklet-server-data && blocklet server start
```

### 2. Create blocklet app

```shell
blocklet create --did=z2qaEyH81kUVDffYQrkdokmAFCeRVCFqNESsN
```

- I create an app named surge-wallet in the project root path

### 3. Replace app dir

```shell
rm -rf ./surge-wallet/app && cp -r ./dist ./surge-wallet/app
```

### 4. run in dev mode

```shell
blocklet dev
```

### 5. run in product mode

```shell
pnpm bundle 

blocklet deploy .blocklet/bundle --app-id=zNKiFDb3y4HZT49xssBGCVp5BhXsxqcf3sGy
```
