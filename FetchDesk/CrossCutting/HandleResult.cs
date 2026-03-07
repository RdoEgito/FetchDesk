using static MassTransit.ValidationResultExtensions;

namespace fetch_desk.CrossCutting
{
    public class HandleResult(int statusCode, string? message = null)
    {
        public int StatusCode { get; init; } = statusCode;
        public string? Message { get; init; } = message;

        public enum HandleStatus
        {
            Success = 200,
            NotFound = 404,
            BadRequest = 400,
            InternalServerError = 500
        }

        public bool IsSuccess() => StatusCode >= 200 && StatusCode < 300;
        public bool IsNotFound() => StatusCode == (int)HandleStatus.NotFound;
        public bool IsBadRequest() => StatusCode == (int)HandleStatus.BadRequest;
        public bool IsInternalServerError() => StatusCode == (int)HandleStatus.InternalServerError;

        public static HandleResult AsSuccess(string? message = null) => new((int)HandleStatus.Success, message);
        public static HandleResult AsNotFound(string? message = null) => new((int)HandleStatus.NotFound, message);
        public static HandleResult AsBadRequest(string? message = null) => new((int)HandleStatus.BadRequest, message);
        public static HandleResult AsInternalServerError(string? message = null) => new((int)HandleStatus.InternalServerError, message);
    }


    public class HandleResult<T> : HandleResult
    {
        public HandleResult(T result, int statucCode, string? message)
            : base(statucCode, message)
        {
            Result = result;
            StatusCode = statucCode;
            Message = message;
        }

        public T Result { get; set; }

        public static HandleResult AsSuccess(T result, string? message = null) => new HandleResult<T>(result, (int)HandleStatus.Success, message);
        public static HandleResult AsNotFound(T result, string? message = null) => new HandleResult<T>(result, (int)HandleStatus.NotFound, message);
        public static HandleResult AsBadRequest(T result, string? message = null) => new HandleResult<T>(result, (int)HandleStatus.BadRequest, message);
        public static HandleResult AsInternalServerError(T result, string? message = null) => new HandleResult<T>(result, (int)HandleStatus.InternalServerError, message);
    }
}
