import io
import os

import boto3

from base_api import logger


class S3Service:
    def __init__(self):
        key = os.getenv('S3_ACCESS_KEY')
        secret = os.getenv('S3_SECRET')
        self.client = boto3.client(
            's3',
            aws_access_key_id=key,
            aws_secret_access_key=secret,
        )
        self.bucket = 'robotlab-trades'

    def list_files(self, folder: str = '') -> list[str]:
        logger.info(f"Getting files from bucket {self.bucket}/{folder}")
        s3_files = self.client.list_objects_v2(Bucket=self.bucket, Prefix=folder)
        # logger.info(s3_files)
        files = []
        for content in s3_files.get('Contents'):
            key = content.get('Key')
            files.append(key)
        logger.info("Found S3 files: %r" % files)
        return files

    def get_file_data(self, file_name):
        response = self.client.get_object(Bucket=self.bucket, Key=file_name)
        file_obj = io.BytesIO(response.get('Body').read())
        return file_obj
