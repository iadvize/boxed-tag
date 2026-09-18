VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | awk '{$1=$1};1')
BUCKET_PATH=s3://idz-${TARGET_ENV}-main-front-static-files/boxed-tag/$VERSION/

echo Pushing to S3 $BUCKET_PATH
docker run --rm \
  -v $(pwd)/web:/app \
  --workdir=/app \
  -e "AWS_DEFAULT_REGION=eu-central-1" \
  -e "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" \
  -e "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" \
  amazon/aws-cli \
  s3 sync ./ $BUCKET_PATH --cache-control "public, max-age=31536000"
