import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-serif text-xl text-[#0A4338]">Informations personnelles</h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                    Mettez à jour vos coordonnées pour vos prochaines livraisons.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nom complet" className="text-[#6B7280] font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="name"
                        className="mt-1.5 block w-full border-[#E5E7EB] focus:border-[#C2A65A] focus:ring-[#C2A65A]/20 rounded-xl text-sm"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Adresse e-mail" className="text-[#6B7280] font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1.5 block w-full border-[#E5E7EB] focus:border-[#C2A65A] focus:ring-[#C2A65A]/20 rounded-xl text-sm"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        disabled={processing}
                        className="bg-[#0A4338] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#C2A65A] hover:text-[#0A4338] transition active:scale-95 disabled:opacity-50"
                    >
                        Enregistrer
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-emerald-600">✓ Enregistré.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
