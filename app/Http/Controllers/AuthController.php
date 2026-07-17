<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Inertia\Inertia;

class AuthController extends Controller
{
    // --- PARTIE CONNEXION (LOGIN) ---
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // 🛡️ Redirection directe de l'admin vers son tableau de bord
            if (Auth::user()->is_admin == 1 || Auth::user()->is_admin === true) {
                return redirect()->route('admin.products.index');
            }

            // 👓 Redirection client vers la boutique
            return redirect()->route('home');
        }

        throw ValidationException::withMessages([
            'email' => 'Identifiants incorrects.',
        ]);
    }

    // --- PARTIE INSCRIPTION (REGISTER) 🔥 ---
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Confirmed kay-verifi 'password_confirmation' auto
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Cryptage du mot de passe direct
        ]);

        // Connexion automatique après l'inscription
        Auth::login($user);

        return redirect()->route('home');
    }

    // --- DÉCONNEXION ---
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
