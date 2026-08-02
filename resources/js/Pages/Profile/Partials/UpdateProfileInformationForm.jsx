import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
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
                <h2 className="font-serif text-xl text-neutral-900">Informations personnelles</h2>
                <p className="mt-1 text-sm text-neutral-500">
                    Mettez à jour vos coordonnées pour vos prochaines livraisons.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Nom complet" className="text-neutral-700 font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="name"
                        className="mt-1.5 block w-full border-neutral-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl text-sm"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Adresse e-mail" className="text-neutral-700 font-bold text-xs uppercase tracking-wider" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1.5 block w-full border-neutral-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl text-sm"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        disabled={processing}
                        className="bg-neutral-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-neutral-950 transition active:scale-95 disabled:opacity-50"
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
