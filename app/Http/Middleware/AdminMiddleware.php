<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Test direct 3la is_admin dial user li connecti
        if (!Auth::check() || !Auth::user()->is_admin) {
            abort(403, 'Accès interdit. Vous devez être Admin.');
        }

        return $next($request);
    }
}
