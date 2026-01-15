# generate frontend
npm run build:ui
rm -rf node_modules
# generate image
docker build -t phonebook .
# sanity check, should access app on localhost
docker run --rm --name phonebook -p 80:3001 phonebook
# manually set up architecture
# eventually delete previous image
docker images
docker rmi -f 1d2791afa528
docker build --platform linux/amd64 -t phonebook . 
docker tag phonebook thomastoumasu/gcr-phonebook && docker push thomastoumasu/gcr-phonebook

# https://console.cloud.google.com/run/create?enableapi=false&project=dwk-gke-480809
# Container image url: docker.io/thomastoumasu/gcr-phonebook:latest
REGION=europe-west1; SERVICE=gcr-phonebook
gcloud run deploy $SERVICE --image docker.io/thomastoumasu/gcr-phonebook:latest --region $REGION --no-invoker-iam-check
gcloud run services delete $SERVICE --region $REGION