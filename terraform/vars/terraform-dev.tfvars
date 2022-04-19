environment               = "dev"
logger_level                 = "debug"
desired_count             = 1
auto_scaling_min_capacity = 1
auto_scaling_max_capacity = 5

container_port            = 80
node_env                  = "dev"
suppress_no_config_warning= "true"
control_tower_url         = "https://staging-api.resourcewatch.org"
areas_api_url             = "https://gfw-staging.globalforestwatch.org/v1"
geostore_api_url          = "https://gfw-staging.globalforestwatch.org/v1"
api_version               = "v1"

healthcheck_path = "/v1/fw_api/healthcheck"
healthcheck_sns_emails = ["server@3sidedcube.com"]