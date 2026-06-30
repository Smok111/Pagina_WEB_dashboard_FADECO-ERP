import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import KpiCard from '@/components/dashboard/KpiCard';

expect.extend(toHaveNoViolations as any);

describe('Accessibility smoke tests', () => {
  it('KpiCard should have no accessibility violations', async () => {
    const { container } = render(<KpiCard titulo="Ventas" valor="S/0.00" change="+0%" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
