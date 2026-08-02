import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) { reset('password', 'password_confirmation'); passwordInput.current.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current.focus(); }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-serif text-xl text-[#0A4338]">Sécurité du compte</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                    Utilisez un mot de passe sécurisé pour protéger vos données.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="current_password" value="Mot de passe actuel" className="text-[#6B7280] font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        className="mt-1.5 block w-full border-[#E5E7EB] focus:border-[#C2A65A] focus:ring-[#C2A65A]/20 rounded-xl text-sm"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nouveau mot de passe" className="text-[#6B7280] font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        type="password"
                        className="mt-1.5 block w-full border-[#E5E7EB] focus:border-[#C2A65A] focus:ring-[#C2A65A]/20 rounded-xl text-sm"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        disabled={processing}
                        className="bg-[#0A4338] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#C2A65A] hover:text-[#0A4338] transition active:scale-95 disabled:opacity-50"
                    >
                        Mettre à jour
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-emerald-600">✓ Modifié avec succès.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
