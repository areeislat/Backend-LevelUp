#!/bin/bash
# Deployment script for Google Cloud Platform
# This script helps deploy the application to Cloud Run or App Engine

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration variables (update these)
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="ecommerce-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     E-Commerce Backend - GCP Deployment Tool     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Function to deploy to Cloud Run
deploy_cloud_run() {
    echo -e "${YELLOW}Starting Cloud Run deployment...${NC}"
    echo ""
    
    # Set the project
    echo "Setting GCP project to: ${PROJECT_ID}"
    gcloud config set project ${PROJECT_ID}
    
    # Enable required APIs
    echo -e "${YELLOW}Enabling required APIs...${NC}"
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    # Build the container image
    echo -e "${YELLOW}Building container image...${NC}"
    gcloud builds submit --tag ${IMAGE_NAME}
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed. Please check the errors above.${NC}"
        exit 1
    fi
    
    # Deploy to Cloud Run
    echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME} \
        --platform managed \
        --region ${REGION} \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300 \
        --set-env-vars NODE_ENV=production
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo ""
        echo "Your service is now running at:"
        gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
        echo ""
        echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
        echo "1. Configure environment variables in Cloud Run console"
        echo "2. Set up MongoDB connection (use MongoDB Atlas or Cloud SQL)"
        echo "3. Configure secrets using Secret Manager"
        echo "4. Set up custom domain (optional)"
    else
        echo -e "${RED}Deployment failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Function to deploy to App Engine
deploy_app_engine() {
    echo -e "${YELLOW}Starting App Engine deployment...${NC}"
    echo ""
    
    # Set the project
    echo "Setting GCP project to: ${PROJECT_ID}"
    gcloud config set project ${PROJECT_ID}
    
    # Enable required APIs
    echo -e "${YELLOW}Enabling App Engine API...${NC}"
    gcloud services enable appengine.googleapis.com
    
    # Create App Engine app if it doesn't exist
    echo -e "${YELLOW}Checking App Engine app...${NC}"
    gcloud app describe &> /dev/null
    if [ $? -ne 0 ]; then
        echo "Creating App Engine app in region ${REGION}..."
        gcloud app create --region=${REGION}
    fi
    
    # Deploy to App Engine
    echo -e "${YELLOW}Deploying to App Engine...${NC}"
    gcloud app deploy app.yaml --quiet
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo ""
        echo "Your service is now running at:"
        gcloud app browse --no-launch-browser
        echo ""
        echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
        echo "1. Configure environment variables in app.yaml or GCP Console"
        echo "2. Set up MongoDB connection (use MongoDB Atlas)"
        echo "3. Configure secrets using Secret Manager"
        echo "4. Check logs: gcloud app logs tail -s default"
    else
        echo -e "${RED}Deployment failed. Please check the errors above.${NC}"
        exit 1
    fi
}

# Menu
echo "Select deployment target:"
echo "1) Cloud Run (Recommended - Serverless, containerized)"
echo "2) App Engine (Traditional PaaS)"
echo "3) Exit"
echo ""
read -p "Enter your choice [1-3]: " choice

case $choice in
    1)
        deploy_cloud_run
        ;;
    2)
        deploy_app_engine
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option. Please choose 1, 2, or 3.${NC}"
        exit 1
        ;;
esac
