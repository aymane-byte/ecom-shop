import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setConfirmingUserDeletion(false),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="font-serif text-xl text-rose-600">Zone de danger</h2>
                <p className="mt-1 text-sm text-neutral-500">
                    La suppression de votre compte est irréversible. Toutes vos données seront effacées.
                </p>
            </header>

            <button
                onClick={() => setConfirmingUserDeletion(true)}
                className="mt-6 bg-rose-50 text-rose-600 border border-rose-200 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition active:scale-95"
            >
                Supprimer définitivement mon compte
            </button>

            <Modal show={confirmingUserDeletion} onClose={() => setConfirmingUserDeletion(false)}>
                <form onSubmit={deleteUser} className="p-8 bg-[#faf7f0]">
                    <h2 className="font-serif text-2xl text-neutral-900">Confirmer la suppression</h2>
                    <p className="mt-3 text-sm text-neutral-600">
                        Veuillez entrer votre mot de passe pour confirmer que vous souhaitez supprimer votre compte 5witm.
                    </p>

                    <div className="mt-6">
                        <TextInput
                            id="password"
                            type="password"
                            className="mt-1 block w-full border-neutral-200 focus:border-rose-400 focus:ring-rose-400/20 rounded-xl"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Mot de passe"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setConfirmingUserDeletion(false)}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 transition"
                        >
                            Annuler
                        </button>
                        <button
                            disabled={processing}
                            className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50"
                        >
                            Confirmer la suppression
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
