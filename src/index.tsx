// Global Components
import * as React from 'react';
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useParams,
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

/* eslint-disable perfectionist/sort-modules */
type $SearchParams = Record<string, string | undefined>;

export type $RedirectParams = {
  pathname: string;
  search?: Record<string, string>;
  state?: unknown;
};

export type $ReplaceParams = {
  pathname: string;
};

export type $NavigationService = {
  readonly addListener: (listener: $Listener) => number;
  readonly getCurrentPathname: () => (null | string);
  readonly getSearchParams: () => $SearchParams;
  readonly redirect: (arg0: $RedirectParams) => $RedirectParams;
  readonly render: () => React.ReactNode;
  readonly replace: (arg0: $ReplaceParams) => $ReplaceParams;
};

export type $WithRouter = {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  params: $SearchParams;
}

/** @deprecated Use `React Router hooks` instead */
export const withRouter = <Props extends $WithRouter>(
  Component: React.ComponentType<Props>,
) => (props: Omit<Props, keyof $WithRouter>) => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();

    return (
      <Component
        {...(props as Props)}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
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
      return new Proxy(
        new URLSearchParams(window.location.search),
        {
          get: (searchParams, prop : string): null | string => searchParams.get(prop),
        },
      );
    }

    return {
    };
  },
  redirect: (params: $RedirectParams): $RedirectParams => {
    if (globalNavigation !== null) {
      const {
        pathname,
        search,
        state,
      } = params;

      let path: string | {
        pathname: string;
        search: string;
      } = pathname;

      if (search) {
        path = {
          pathname,
          search: createSearchParams(search).toString(),
        };
      }

      globalNavigation(
        path,
        {
          state,
        },
      );
    }

    return params;
  },
  render: Spy,
  replace: (params: $ReplaceParams): $ReplaceParams => {
    if (window && window.history) {
      window.history.replaceState(
        null,
        '',
        params.pathname,
      );
    }

    return params;
  },
};

export default NavigationService;
