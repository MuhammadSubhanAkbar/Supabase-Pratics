import { useActionState } from 'react';
import supabase from './supbase-client.js';

function Form({ metrics }) {
    const [error, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
            const name = formData.get('name');
            const amount = Number(formData.get('value'));

            // 1️⃣ Get current value
            const { data, error: fetchError } = await supabase
                .from('sales_deals')
                .select('value')
                .eq('name', name)
                .single();

            if (fetchError) {
                console.error('Fetch error:', fetchError.message);
                return new Error('Failed to fetch current deal value');
            }

            // 2️⃣ Update with incremented value
            const { error: updateError } = await supabase
                .from('sales_deals')
                .update({ value: 'value'})
                .eq('name', name);

            if (updateError) {
                console.error('Update error:', updateError.message);
                return new Error('Failed to update deal value');
            }

            return null;
        },
        null
    );

    const generateOptions = () =>
        metrics.map((metric) => (
            <option key={metric.name} value={metric.name}>
                {metric.name}
            </option>
        ));

    return (
        <div className="add-form-container">
            <form action={submitAction} aria-label="Add new sales deal">
                <label htmlFor="deal-name">
                    Name:
                    <select
                        id="deal-name"
                        name="name"
                        defaultValue={metrics?.[0]?.name || ''}
                        disabled={isPending}
                        aria-invalid={!!error}
                    >
                        {generateOptions()}
                    </select>
                </label>

                <label htmlFor="deal-value">
                    Amount: $
                    <input
                        id="deal-value"
                        type="number"
                        name="value"
                        defaultValue={0}
                        min="0"
                        step="10"
                        disabled={isPending}
                        aria-invalid={!!error}
                    />
                </label>

                <button type="submit" disabled={isPending}>
                    {isPending ? 'Adding...' : 'Add Deal'}
                </button>
            </form>

            {error && (
                <div role="alert" className="error-message">
                    {error.message}
                </div>
            )}
        </div>
    );
}

export default Form;
