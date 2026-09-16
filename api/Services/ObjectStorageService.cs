using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace NevaBook.Api.Services;

public sealed record ObjectStorageOptions(string Endpoint, string Region, string Bucket, string AccessKey, string SecretKey)
{
    public static ObjectStorageOptions FromConfiguration(IConfiguration configuration) => new(
        configuration["S3:Endpoint"] ?? "",
        configuration["S3:Region"] ?? "us-east-1",
        configuration["S3:Bucket"] ?? "neva-book",
        configuration["S3:AccessKey"] ?? "",
        configuration["S3:SecretKey"] ?? "");
}

public sealed class ObjectStorageService
{
    private readonly ObjectStorageOptions _options;
    private readonly IAmazonS3? _client;

    public ObjectStorageService(IConfiguration configuration)
    {
        _options = ObjectStorageOptions.FromConfiguration(configuration);
        if (string.IsNullOrWhiteSpace(_options.Endpoint) || string.IsNullOrWhiteSpace(_options.AccessKey)) return;
        var credentials = new BasicAWSCredentials(_options.AccessKey, _options.SecretKey);
        var config = new AmazonS3Config { ServiceURL = _options.Endpoint, ForcePathStyle = true, AuthenticationRegion = _options.Region };
        _client = new AmazonS3Client(credentials, config);
    }

    public bool IsConfigured => _client is not null;

    public async Task<string> CreateUploadUrl(string objectKey, string contentType)
    {
        if (_client is null) throw new InvalidOperationException("S3 is not configured.");
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _options.Bucket,
            Key = objectKey,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(20),
            ContentType = contentType
        };
        return await _client.GetPreSignedURLAsync(request);
    }
}
