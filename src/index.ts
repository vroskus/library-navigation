// Global Components
import * as React from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

// Types
import type {
  Location,
  NavigateFunction,
} from 'react-router-dom';

export type $Location = Location;

type $Listener = (location: Location) => unknown;

let globalNavigation: NavigateFunction | null = null;
const listeners: Array<$Listener> = [];

const trackNavigationChange = (location: Location): void => {
  listeners.forEach((listener: $Listener) => {
    listener(location);
  });
};

const Spy = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(
    () => {
      globalNavigation = navigate;

      trackNavigationChange(location);
    },
    [],
  );

  React.useEffect(
    () => {
      trackNavigationChange(location);
    },
    [location],
  );

  return null;
};

export type $RedirectParams = {
  pathname: string;
  state?: unknown;
};
export type $RedirectResponse = $RedirectParams;

export type $NavigationService = {
  readonly addListener: (listener: $Listener) => number;
  readonly getCurrentPathname: () => (null | string);
  readonly getSearchParams: () => Record<string, string | void>;
  readonly redirect: (arg0: $RedirectParams) => $RedirectResponse;
  readonly render: () => React.ReactNode;
};

const NavigationService: $NavigationService = {
  addListener: (listener: $Listener) => listeners.push(listener),
  getCurrentPathname: () => {
    if (window && window.location) {
      return window.location.pathname || null;
    }

    return null;
  },
  getSearchParams: () => {
    if (window && window.location) {
      const params = new Proxy(
        new URLSearchParams(window.location.search),
        {
          get: (searchParams, prop : string): string | void => searchParams.get(prop),
        },
      );

      return params;
    }

    return {
    };
  },
  redirect: (params: $RedirectParams): $RedirectResponse => {
    if (globalNavigation !== null) {
      const {
        pathname,
        state,
      } = params;

      globalNavigation(
        pathname,
        {
          state,
        },
      );
    }

    return params;
  },
  render: Spy,
};

export default NavigationService;
