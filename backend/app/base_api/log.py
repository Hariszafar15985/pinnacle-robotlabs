from logstash import LogstashHandler, LogstashFormatterVersion1, TCPLogstashHandler


class CustomFormatter(LogstashFormatterVersion1):
    def format(self, record):
        message = {
            '@timestamp': self.format_timestamp(record.created),
            '@version': '1',
            'message': record.getMessage(),
            'host': {
                'ip': "127.0.0.1",
                'name': 'backend'
            },
            'path': record.pathname,
            'tags': self.tags,
            'type': self.message_type,

            # Extra Fields
            'level': record.levelname,
            'logger_name': record.name,
        }

        # Add extra fields
        message.update(self.get_extra_fields(record))

        # If exception, add debug info
        if record.exc_info:
            message.update(self.get_debug_fields(record))
        return self.serialize(message)


class CustomLogstashHandler(LogstashHandler):
    def __init__(self, host, port=5959, message_type='logstash', tags=None, fqdn=False, version=0):
        super(TCPLogstashHandler, self).__init__(host, port)
        self.formatter = CustomFormatter(message_type, tags, fqdn)

    def makePickle(self, record):
        return self.formatter.format(record)
