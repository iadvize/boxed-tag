VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | awk '{$1=$1};1')
BUCKET_PATH=s3://idz-prod-main-front-ui-assets/boxed-tag/$VERSION/

echo Pushing to S3 $BUCKET_PATH
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
docker run --rm -it \
  -v $(pwd)/web:/app \
  --workdir=/app \
  -e "AWS_DEFAULT_REGION=eu-central-1" \
  -e "AWS_ACCESS_KEY_ID=${STATIC_RESOURCES_AWS_ACCESS_KEY_ID}" \
  -e "AWS_SECRET_ACCESS_KEY=${STATIC_RESOURCES_AWS_SECRET_ACCESS_KEY}" \
  iadvize/aws-cli \
  s3 sync ./ $BUCKET_PATH --acl public-read