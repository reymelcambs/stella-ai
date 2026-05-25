# Cloud Run deployment script for project cbc-ai-5c869
# Run this after installing and authenticating Google Cloud SDK.

param(
  [Parameter(Mandatory=$true)]
  [string]$ResendApiKey,

  [Parameter(Mandatory=$true)]
  [string]$FirebaseApiKey,

  [Parameter(Mandatory=$false)]
  [string]$RedisUrl = "",

  [Parameter(Mandatory=$false)]
  [string]$Region = "us-central1"
)

# Set the Cloud project
gcloud config set project cbc-ai-5c869

# Enable required APIs
gcloud services enable run.googleapis.com `
  compute.googleapis.com `
  cloudbuild.googleapis.com `
  secretmanager.googleapis.com `
  iam.googleapis.com `
  cloudarmor.googleapis.com `
  artifactregistry.googleapis.com

# Create or update secret values
if (-not (gcloud secrets describe RESEND_API_KEY --project=cbc-ai-5c869 --quiet 2>$null)) {
  gcloud secrets create RESEND_API_KEY --replication-policy="automatic" --project=cbc-ai-5c869
}
$ResendApiKey | gcloud secrets versions add RESEND_API_KEY --data-file=- --project=cbc-ai-5c869

if (-not (gcloud secrets describe FIREBASE_API_KEY --project=cbc-ai-5c869 --quiet 2>$null)) {
  gcloud secrets create FIREBASE_API_KEY --replication-policy="automatic" --project=cbc-ai-5c869
}
$FirebaseApiKey | gcloud secrets versions add FIREBASE_API_KEY --data-file=- --project=cbc-ai-5c869

# Build and push container to Artifact Registry
# You can change the repository name if desired.
$ImageName = "gcr.io/cbc-ai-5c869/stellas-ai"
gcloud builds submit --tag $ImageName --project=cbc-ai-5c869

# Deploy to Cloud Run
$SecretBindings = "RESEND_API_KEY=projects/cbc-ai-5c869/secrets/RESEND_API_KEY:latest,FIREBASE_API_KEY=projects/cbc-ai-5c869/secrets/FIREBASE_API_KEY:latest"
$EnvBindings = @("NODE_ENV=production")
if ($RedisUrl -ne "") {
  $EnvBindings += "REDIS_URL=$RedisUrl"
}

$EnvString = $EnvBindings -join ","

gcloud run deploy stellas-ai `
  --image $ImageName `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --set-secrets $SecretBindings `
  --update-env-vars $EnvString `
  --project=cbc-ai-5c869

Write-Host "Cloud Run deployment complete. Service name: stellas-ai"
Write-Host "Use 'gcloud run services describe stellas-ai --region $Region --project cbc-ai-5c869' to inspect the deployed service."
