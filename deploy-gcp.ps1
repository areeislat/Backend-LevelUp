# Deployment script for Google Cloud Platform (PowerShell)
# This script helps deploy the application to Cloud Run or App Engine

# Configuration variables (update these)
$PROJECT_ID = "starlit-tube-479621-g3"
$REGION = "us-central1"
$SERVICE_NAME = "ecommerce-backend"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     E-Commerce Backend - GCP Deployment Tool     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Function to deploy to Cloud Run
function Deploy-CloudRun {
    Write-Host "Starting Cloud Run deployment..." -ForegroundColor Yellow
    Write-Host ""
    
    # Set the project
    Write-Host "Setting GCP project to: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    Write-Host "Enabling required APIs..." -ForegroundColor Yellow
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    # Build the container image
    Write-Host "Building container image..." -ForegroundColor Yellow
    gcloud builds submit --tag $IMAGE_NAME
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed. Please check the errors above." -ForegroundColor Red
        exit 1
    }
    
    # Deploy to Cloud Run
    Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
    gcloud run deploy $SERVICE_NAME `
        --image $IMAGE_NAME `
        --platform managed `
        --region $REGION `
        --allow-unauthenticated `
        --port 8080 `
        --memory 512Mi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --timeout 300 `
        --set-env-vars NODE_ENV=production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your service is now running at:"
        gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
        Write-Host ""
        Write-Host "⚠️  Don't forget to:" -ForegroundColor Yellow
        Write-Host "1. Configure environment variables in Cloud Run console"
        Write-Host "2. Set up MongoDB connection (use MongoDB Atlas or Cloud SQL)"
        Write-Host "3. Configure secrets using Secret Manager"
        Write-Host "4. Set up custom domain (optional)"
    } else {
        Write-Host "Deployment failed. Please check the errors above." -ForegroundColor Red
        exit 1
    }
}

# Function to deploy to App Engine
function Deploy-AppEngine {
    Write-Host "Starting App Engine deployment..." -ForegroundColor Yellow
    Write-Host ""
    
    # Set the project
    Write-Host "Setting GCP project to: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    Write-Host "Enabling App Engine API..." -ForegroundColor Yellow
    gcloud services enable appengine.googleapis.com
    
    # Create App Engine app if it doesn't exist
    Write-Host "Checking App Engine app..." -ForegroundColor Yellow
    gcloud app describe 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating App Engine app in region $REGION..."
        gcloud app create --region=$REGION
    }
    
    # Deploy to App Engine
    Write-Host "Deploying to App Engine..." -ForegroundColor Yellow
    gcloud app deploy app.yaml --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your service is now running at:"
        gcloud app browse --no-launch-browser
        Write-Host ""
        Write-Host "⚠️  Don't forget to:" -ForegroundColor Yellow
        Write-Host "1. Configure environment variables in app.yaml or GCP Console"
        Write-Host "2. Set up MongoDB connection (use MongoDB Atlas)"
        Write-Host "3. Configure secrets using Secret Manager"
        Write-Host "4. Check logs: gcloud app logs tail -s default"
    } else {
        Write-Host "Deployment failed. Please check the errors above." -ForegroundColor Red
        exit 1
    }
}

# Menu
Write-Host "Select deployment target:"
Write-Host "1) Cloud Run (Recommended - Serverless, containerized)"
Write-Host "2) App Engine (Traditional PaaS)"
Write-Host "3) Exit"
Write-Host ""
$choice = Read-Host "Enter your choice [1-3]"

switch ($choice) {
    "1" {
        Deploy-CloudRun
    }
    "2" {
        Deploy-AppEngine
    }
    "3" {
        Write-Host "Exiting..."
        exit 0
    }
    default {
        Write-Host "Invalid option. Please choose 1, 2, or 3." -ForegroundColor Red
        exit 1
    }
}
