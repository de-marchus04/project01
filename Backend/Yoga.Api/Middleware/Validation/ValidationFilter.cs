using Microsoft.AspNetCore.Mvc.Filters;
using FluentValidation;
using Yoga.Application.Exceptions;

namespace Yoga.Api.Middleware.Validation;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var arguments = context.ActionArguments.Values.Where(v => v != null);

        foreach (var argument in arguments)
        {
            var argumentType = argument!.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(argumentType);
            var validator = context.HttpContext.RequestServices.GetService(validatorType) as IValidator;

            if (validator != null)
            {
                var validationContext = new ValidationContext<object>(argument);
                var validationResult = await validator.ValidateAsync(validationContext);

                if (!validationResult.IsValid)
                {
                    var failures = validationResult.Errors
                        .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
                        .ToDictionary(g => g.Key, g => g.ToArray());

                    throw new Yoga.Application.Exceptions.ValidationException(failures);
                }
            }
        }

        await next();
    }
}
