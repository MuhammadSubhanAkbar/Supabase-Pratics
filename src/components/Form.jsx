import { useActionState } from 'react';
import supabase from '../supbase-client.js';

function Form({ metrics }) {
    const [error, submitAction, isPending] = useActionState(
        async (_, formData) => {
            const name = formData.get('name');
            const amount = Math.round(Number(formData.get('value')));

            if (!name || amount <= 0) {
                return new Error('Enter a valid amount');
            }

            const { data, error: fetchError } = await supabase
                .from('sale_deals')
                .select('value')
                .eq('name', name)
                .single();

            if (fetchError) return new Error(fetchError.message);

            const newValue = data.value + amount;

            const { error: updateError } = await supabase
                .from('sale_deals')
                .update({ value: newValue })
                .eq('name', name);

            if (updateError) return new Error(updateError.message);

            return null;
        },
        null
    );

    return (
        <form action={submitAction}>
            <select name="name">
                {metrics.map(m => (
                    <option key={m.name} value={m.name}>
                        {m.name}
                    </option>
                ))}
            </select>

            <input
                type="number"
                name="value"
                min="0"
                step="1"
                placeholder="Amount"
                className="pr-2.5"
            />

            <button disabled={isPending}>
                {isPending ? 'Updating...' : 'Add'}
            </button>

            {error && <p>{error.message}</p>}
        </form>
    );
}

export default Form;
