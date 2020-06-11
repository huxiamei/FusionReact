import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import React, { Suspense } from 'react';
import path from 'path';
import routes from '@/config/routes';
import PageLoading from '@/components/PageLoading';

const RouteItem = (props) => {
  // const { redirect, path: routePath, component, key } = props;
  const { redirect, path: routePath, key, component, children, ...ohters } = props;
  if (redirect) {
    return (
      <Redirect
        exact
        key={key}
        from={routePath}
        to={redirect}
      />
    );
  }
  if (!children) {
    return (
      <Route
        key={key}
        component={component}
        path={routePath}
      />
    );
  }

  const { component: RouteComponent2, children: children2, ...others2 } = children;
  return (
    <Route
      key={key}
      {...others2}
      component={(props2) => {
        return (
          children2 ? (
            <RouteComponent2 key={key} {...props2}>
              <Switch>
                {children2.map((routeChild, idx) => {
                  const {redirect: redirect2, path: childPath, component: component2} = routeChild;
                  return RouteItem({
                    key: `${key}-${idx}`,
                    redirect: redirect2,
                    path: childPath && path.join(routePath, childPath),
                    component: component2,
                    children: children2[idx],
                  });
                })}
              </Switch>
            </RouteComponent2>
          ) : (
            <Route
              key={key}
              component={RouteComponent2}
              path={routePath}
            />
          )
        );
      }}
    />
    );
};

const router = () => {
  return (
    <Router>
      <Switch>
        {routes.map((route, id) => {
          const { component: RouteComponent, children, ...others } = route;
          return (
            <Route
              key={id}
              {...others}
              component={(props) => {
                return (
                  children ? (
                    <RouteComponent key={id} {...props}>
                      <Suspense fallback={<PageLoading />}>
                        <Switch>
                          {children.map((routeChild, idx) => {
                            const { redirect, path: childPath, component } = routeChild;
                            return RouteItem({
                              key: `${id}-${idx}`,
                              redirect,
                              path: childPath && path.join(route.path, childPath),
                              component,
                              children: children[idx],
                            });
                          })}
                        </Switch>
                      </Suspense>
                    </RouteComponent>
                  ) : (
                    <Suspense fallback={<PageLoading />}>
                      {
                        RouteItem({
                          key: id,
                          ...route,
                        })
                      }
                    </Suspense>
                  )
                );
              }}
            />
          );
        })}
      </Switch>
    </Router>
  );
};

export default router;
