import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { axe, toHaveNoViolations } from 'jest-axe';
import KpiCard from '@/components/dashboard/KpiCard';

expect.extend(toHaveNoViolations as any);

describe('Accessibility smoke tests', () => {
  it('KpiCard should have no accessibility violations', async () => {
    const html = renderToString(<KpiCard titulo="Ventas" valor="S/0.00" change="+0%" />);
    const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`);
    const results = await axe(dom.window.document);
    expect(results).toHaveNoViolations();
  }, 10000);
});
