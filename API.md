# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Dashboard <a name="Dashboard" id="cdk8s-grafana.Dashboard"></a>

A Grafana dashboard.

> [https://grafana.com/docs/grafana/latest/http_api/dashboard/](https://grafana.com/docs/grafana/latest/http_api/dashboard/)

#### Initializers <a name="Initializers" id="cdk8s-grafana.Dashboard.Initializer"></a>

```typescript
import { Dashboard } from 'cdk8s-grafana'

new Dashboard(scope: Construct, id: string, props: DashboardProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.Dashboard.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-grafana.Dashboard.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-grafana.Dashboard.Initializer.parameter.props">props</a></code> | <code><a href="#cdk8s-grafana.DashboardProps">DashboardProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-grafana.Dashboard.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk8s-grafana.Dashboard.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk8s-grafana.Dashboard.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk8s-grafana.DashboardProps">DashboardProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-grafana.Dashboard.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk8s-grafana.Dashboard.addPlugins">addPlugins</a></code> | Adds one or more plugins. |

---

##### `toString` <a name="toString" id="cdk8s-grafana.Dashboard.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addPlugins` <a name="addPlugins" id="cdk8s-grafana.Dashboard.addPlugins"></a>

```typescript
public addPlugins(plugins: GrafanaPlugin): void
```

Adds one or more plugins.

###### `plugins`<sup>Required</sup> <a name="plugins" id="cdk8s-grafana.Dashboard.addPlugins.parameter.plugins"></a>

- *Type:* <a href="#cdk8s-grafana.GrafanaPlugin">GrafanaPlugin</a>

---




### DataSource <a name="DataSource" id="cdk8s-grafana.DataSource"></a>

A Grafana data source.

> [https://grafana.com/docs/grafana/latest/administration/provisioning/#example-data-source-config-file](https://grafana.com/docs/grafana/latest/administration/provisioning/#example-data-source-config-file)

#### Initializers <a name="Initializers" id="cdk8s-grafana.DataSource.Initializer"></a>

```typescript
import { DataSource } from 'cdk8s-grafana'

new DataSource(scope: Construct, id: string, props: DataSourceProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.DataSource.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-grafana.DataSource.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-grafana.DataSource.Initializer.parameter.props">props</a></code> | <code><a href="#cdk8s-grafana.DataSourceProps">DataSourceProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-grafana.DataSource.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk8s-grafana.DataSource.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk8s-grafana.DataSource.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk8s-grafana.DataSourceProps">DataSourceProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-grafana.DataSource.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk8s-grafana.DataSource.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.DataSource.property.name">name</a></code> | <code>string</code> | Name of the data source. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk8s-grafana.DataSource.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the data source.

---


### Grafana <a name="Grafana" id="cdk8s-grafana.Grafana"></a>

A Grafana instance.

#### Initializers <a name="Initializers" id="cdk8s-grafana.Grafana.Initializer"></a>

```typescript
import { Grafana } from 'cdk8s-grafana'

new Grafana(scope: Construct, id: string, props?: GrafanaProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.Grafana.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk8s-grafana.Grafana.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk8s-grafana.Grafana.Initializer.parameter.props">props</a></code> | <code><a href="#cdk8s-grafana.GrafanaProps">GrafanaProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk8s-grafana.Grafana.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk8s-grafana.Grafana.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="cdk8s-grafana.Grafana.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk8s-grafana.GrafanaProps">GrafanaProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-grafana.Grafana.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk8s-grafana.Grafana.addDashboard">addDashboard</a></code> | Creates a dashboard associated with a particular data source. |
| <code><a href="#cdk8s-grafana.Grafana.addDataSource">addDataSource</a></code> | Adds a data source. |

---

##### `toString` <a name="toString" id="cdk8s-grafana.Grafana.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDashboard` <a name="addDashboard" id="cdk8s-grafana.Grafana.addDashboard"></a>

```typescript
public addDashboard(id: string, props: DashboardProps): Dashboard
```

Creates a dashboard associated with a particular data source.

By default, labels are automatically added so that the data source is detected by Grafana.

###### `id`<sup>Required</sup> <a name="id" id="cdk8s-grafana.Grafana.addDashboard.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="cdk8s-grafana.Grafana.addDashboard.parameter.props"></a>

- *Type:* <a href="#cdk8s-grafana.DashboardProps">DashboardProps</a>

---

##### `addDataSource` <a name="addDataSource" id="cdk8s-grafana.Grafana.addDataSource"></a>

```typescript
public addDataSource(id: string, props: DataSourceProps): DataSource
```

Adds a data source.

By default, labels are automatically added so that the data source is detected by Grafana.

###### `id`<sup>Required</sup> <a name="id" id="cdk8s-grafana.Grafana.addDataSource.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="cdk8s-grafana.Grafana.addDataSource.parameter.props"></a>

- *Type:* <a href="#cdk8s-grafana.DataSourceProps">DataSourceProps</a>

---




## Structs <a name="Structs" id="Structs"></a>

### DashboardProps <a name="DashboardProps" id="cdk8s-grafana.DashboardProps"></a>

#### Initializer <a name="Initializer" id="cdk8s-grafana.DashboardProps.Initializer"></a>

```typescript
import { DashboardProps } from 'cdk8s-grafana'

const dashboardProps: DashboardProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.DashboardProps.property.title">title</a></code> | <code>string</code> | Title of the dashboard. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.dataSourceVariables">dataSourceVariables</a></code> | <code>{[ key: string ]: string}</code> | Specify a mapping from data source variables to data source names. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.folder">folder</a></code> | <code>string</code> | Group dashboards into folders. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.jsonModel">jsonModel</a></code> | <code>{[ key: string ]: any}</code> | All other dashboard customizations. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels to apply to the kubernetes resource. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.namespace">namespace</a></code> | <code>string</code> | Namespace to apply to the kubernetes resource. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.plugins">plugins</a></code> | <code><a href="#cdk8s-grafana.GrafanaPlugin">GrafanaPlugin</a>[]</code> | Specify plugins required by the dashboard. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.refreshRate">refreshRate</a></code> | <code>cdk8s.Duration</code> | Auto-refresh interval. |
| <code><a href="#cdk8s-grafana.DashboardProps.property.timeRange">timeRange</a></code> | <code>cdk8s.Duration</code> | Time range for the dashboard, e.g. last 6 hours, last 7 days, etc. |

---

##### `title`<sup>Required</sup> <a name="title" id="cdk8s-grafana.DashboardProps.property.title"></a>

```typescript
public readonly title: string;
```

- *Type:* string

Title of the dashboard.

---

##### `dataSourceVariables`<sup>Optional</sup> <a name="dataSourceVariables" id="cdk8s-grafana.DashboardProps.property.dataSourceVariables"></a>

```typescript
public readonly dataSourceVariables: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no data source variables

Specify a mapping from data source variables to data source names.

This is only needed if you are importing an existing dashboard's JSON and it specifies variables within an "__inputs" field.

---

###### Example <a name="Example" id="cdk8s-grafana.DashboardProps.property.dataSourceVariables.example"></a>

```typescript
{ DS_PROMETHEUS: "my-prometheus-ds" }
```


##### `folder`<sup>Optional</sup> <a name="folder" id="cdk8s-grafana.DashboardProps.property.folder"></a>

```typescript
public readonly folder: string;
```

- *Type:* string
- *Default:* default folder

Group dashboards into folders.

---

##### `jsonModel`<sup>Optional</sup> <a name="jsonModel" id="cdk8s-grafana.DashboardProps.property.jsonModel"></a>

```typescript
public readonly jsonModel: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

All other dashboard customizations.

> [https://grafana.com/docs/grafana/latest/dashboards/json-model/](https://grafana.com/docs/grafana/latest/dashboards/json-model/)

---

##### `labels`<sup>Optional</sup> <a name="labels" id="cdk8s-grafana.DashboardProps.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no labels

Labels to apply to the kubernetes resource.

When adding a dashboard to a Grafana instance using `grafana.addDashboard`, labels provided to Grafana will be automatically applied. Otherwise, labels must be added manually.

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk8s-grafana.DashboardProps.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string
- *Default:* undefined (will be assigned to the 'default' namespace)

Namespace to apply to the kubernetes resource.

When adding a dashboard to a Grafana instance using `grafana.addDashboard`, the namespace will be automatically inherited.

---

##### `plugins`<sup>Optional</sup> <a name="plugins" id="cdk8s-grafana.DashboardProps.property.plugins"></a>

```typescript
public readonly plugins: GrafanaPlugin[];
```

- *Type:* <a href="#cdk8s-grafana.GrafanaPlugin">GrafanaPlugin</a>[]

Specify plugins required by the dashboard.

---

##### `refreshRate`<sup>Optional</sup> <a name="refreshRate" id="cdk8s-grafana.DashboardProps.property.refreshRate"></a>

```typescript
public readonly refreshRate: Duration;
```

- *Type:* cdk8s.Duration
- *Default:* 5 seconds

Auto-refresh interval.

---

##### `timeRange`<sup>Optional</sup> <a name="timeRange" id="cdk8s-grafana.DashboardProps.property.timeRange"></a>

```typescript
public readonly timeRange: Duration;
```

- *Type:* cdk8s.Duration
- *Default:* 6 hours

Time range for the dashboard, e.g. last 6 hours, last 7 days, etc.

---

### DataSourceProps <a name="DataSourceProps" id="cdk8s-grafana.DataSourceProps"></a>

#### Initializer <a name="Initializer" id="cdk8s-grafana.DataSourceProps.Initializer"></a>

```typescript
import { DataSourceProps } from 'cdk8s-grafana'

const dataSourceProps: DataSourceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.access">access</a></code> | <code><a href="#cdk8s-grafana.AccessType">AccessType</a></code> | Access type of the data source. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.name">name</a></code> | <code>string</code> | Name of the data source. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.type">type</a></code> | <code>string</code> | Type of the data source. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.description">description</a></code> | <code>string</code> | Description of the data source. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels to apply to the kubernetes resource. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.namespace">namespace</a></code> | <code>string</code> | Namespace to apply to the kubernetes resource. |
| <code><a href="#cdk8s-grafana.DataSourceProps.property.url">url</a></code> | <code>string</code> | URL of the data source. |

---

##### `access`<sup>Required</sup> <a name="access" id="cdk8s-grafana.DataSourceProps.property.access"></a>

```typescript
public readonly access: AccessType;
```

- *Type:* <a href="#cdk8s-grafana.AccessType">AccessType</a>

Access type of the data source.

---

##### `name`<sup>Required</sup> <a name="name" id="cdk8s-grafana.DataSourceProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the data source.

---

##### `type`<sup>Required</sup> <a name="type" id="cdk8s-grafana.DataSourceProps.property.type"></a>

```typescript
public readonly type: string;
```

- *Type:* string

Type of the data source.

---

##### `description`<sup>Optional</sup> <a name="description" id="cdk8s-grafana.DataSourceProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* no description

Description of the data source.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="cdk8s-grafana.DataSourceProps.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* no labels

Labels to apply to the kubernetes resource.

When adding a data source to a Grafana instance using `grafana.addDataSource`, labels provided to Grafana will be automatically applied. Otherwise, labels must be added manually.

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk8s-grafana.DataSourceProps.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string
- *Default:* undefined (will be assigned to the 'default' namespace)

Namespace to apply to the kubernetes resource.

When adding a data source to a Grafana instance using `grafana.addDataSource`, the namespace will be automatically inherited.

---

##### `url`<sup>Optional</sup> <a name="url" id="cdk8s-grafana.DataSourceProps.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string
- *Default:* default url for data source type

URL of the data source.

Most resources besides the 'testdata' data source type require this field in order to retrieve data.

---

### GrafanaPlugin <a name="GrafanaPlugin" id="cdk8s-grafana.GrafanaPlugin"></a>

#### Initializer <a name="Initializer" id="cdk8s-grafana.GrafanaPlugin.Initializer"></a>

```typescript
import { GrafanaPlugin } from 'cdk8s-grafana'

const grafanaPlugin: GrafanaPlugin = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.GrafanaPlugin.property.name">name</a></code> | <code>string</code> | Name of the plugin, e.g. "grafana-piechart-panel". |
| <code><a href="#cdk8s-grafana.GrafanaPlugin.property.version">version</a></code> | <code>string</code> | Version of the plugin, e.g. "1.3.6". |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk8s-grafana.GrafanaPlugin.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the plugin, e.g. "grafana-piechart-panel".

---

##### `version`<sup>Required</sup> <a name="version" id="cdk8s-grafana.GrafanaPlugin.property.version"></a>

```typescript
public readonly version: string;
```

- *Type:* string

Version of the plugin, e.g. "1.3.6".

---

### GrafanaProps <a name="GrafanaProps" id="cdk8s-grafana.GrafanaProps"></a>

#### Initializer <a name="Initializer" id="cdk8s-grafana.GrafanaProps.Initializer"></a>

```typescript
import { GrafanaProps } from 'cdk8s-grafana'

const grafanaProps: GrafanaProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.adminPassword">adminPassword</a></code> | <code>string</code> | Default admin password. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.adminUser">adminUser</a></code> | <code>string</code> | Default admin username. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.defaultDataSource">defaultDataSource</a></code> | <code><a href="#cdk8s-grafana.DataSourceProps">DataSourceProps</a></code> | Default data source - equivalent to calling `grafana.addDataSource`. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.image">image</a></code> | <code>string</code> | Specify a custom image for Grafana. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.ingress">ingress</a></code> | <code>boolean</code> | Create an ingress to provide external access to the Grafana cluster. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels to apply to all Grafana resources. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.namespace">namespace</a></code> | <code>string</code> | Namespace to apply to all Grafana resources. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.requireLogin">requireLogin</a></code> | <code>boolean</code> | Require login in order to view or manage dashboards. |
| <code><a href="#cdk8s-grafana.GrafanaProps.property.serviceType">serviceType</a></code> | <code>string</code> | Type of service to be created (NodePort, ClusterIP or LoadBalancer). |

---

##### `adminPassword`<sup>Optional</sup> <a name="adminPassword" id="cdk8s-grafana.GrafanaProps.property.adminPassword"></a>

```typescript
public readonly adminPassword: string;
```

- *Type:* string
- *Default:* "secret"

Default admin password.

---

##### `adminUser`<sup>Optional</sup> <a name="adminUser" id="cdk8s-grafana.GrafanaProps.property.adminUser"></a>

```typescript
public readonly adminUser: string;
```

- *Type:* string
- *Default:* "root"

Default admin username.

---

##### `defaultDataSource`<sup>Optional</sup> <a name="defaultDataSource" id="cdk8s-grafana.GrafanaProps.property.defaultDataSource"></a>

```typescript
public readonly defaultDataSource: DataSourceProps;
```

- *Type:* <a href="#cdk8s-grafana.DataSourceProps">DataSourceProps</a>
- *Default:* no data source added

Default data source - equivalent to calling `grafana.addDataSource`.

---

##### `image`<sup>Optional</sup> <a name="image" id="cdk8s-grafana.GrafanaProps.property.image"></a>

```typescript
public readonly image: string;
```

- *Type:* string
- *Default:* "public.ecr.aws/ubuntu/grafana:latest"

Specify a custom image for Grafana.

---

##### `ingress`<sup>Optional</sup> <a name="ingress" id="cdk8s-grafana.GrafanaProps.property.ingress"></a>

```typescript
public readonly ingress: boolean;
```

- *Type:* boolean
- *Default:* true

Create an ingress to provide external access to the Grafana cluster.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="cdk8s-grafana.GrafanaProps.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* { app: "grafana" }

Labels to apply to all Grafana resources.

---

##### `namespace`<sup>Optional</sup> <a name="namespace" id="cdk8s-grafana.GrafanaProps.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* string
- *Default:* undefined (will be assigned to the 'default' namespace)

Namespace to apply to all Grafana resources.

The Grafana Operator must be installed in this namespace for resources to be recognized.

---

##### `requireLogin`<sup>Optional</sup> <a name="requireLogin" id="cdk8s-grafana.GrafanaProps.property.requireLogin"></a>

```typescript
public readonly requireLogin: boolean;
```

- *Type:* boolean
- *Default:* false

Require login in order to view or manage dashboards.

---

##### `serviceType`<sup>Optional</sup> <a name="serviceType" id="cdk8s-grafana.GrafanaProps.property.serviceType"></a>

```typescript
public readonly serviceType: string;
```

- *Type:* string
- *Default:* ClusterIP

Type of service to be created (NodePort, ClusterIP or LoadBalancer).

---



## Enums <a name="Enums" id="Enums"></a>

### AccessType <a name="AccessType" id="cdk8s-grafana.AccessType"></a>

Mode for accessing a data source.

> [https://grafana.com/docs/grafana/latest/administration/provisioning/#example-data-source-config-file](https://grafana.com/docs/grafana/latest/administration/provisioning/#example-data-source-config-file)

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk8s-grafana.AccessType.PROXY">PROXY</a></code> | Access via proxy. |
| <code><a href="#cdk8s-grafana.AccessType.DIRECT">DIRECT</a></code> | Access directly (via server or browser in UI). |

---

##### `PROXY` <a name="PROXY" id="cdk8s-grafana.AccessType.PROXY"></a>

Access via proxy.

---


##### `DIRECT` <a name="DIRECT" id="cdk8s-grafana.AccessType.DIRECT"></a>

Access directly (via server or browser in UI).

---

