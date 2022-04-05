environment               = "production"
logger_level                 = "info"
desired_count             = 2
auto_scaling_min_capacity = 2
auto_scaling_max_capacity = 15

container_port            = 80
node_path                 = "app/src"
node_env                  = "production"
suppress_no_config_warning= "true"
control_tower_url         = "https://api.resourcewatch.org"
areas_api_url             = "https://gfw-staging.globalforestwatch.org/v1"
geostore_api_url          = "https://gfw-staging.globalforestwatch.org/v1"
api_version               = "v1"
healthcheck_path          = "/v1/fw_api/healthcheck"
healthcheck_sns_emails    = ["server@3sidedcube.com"]