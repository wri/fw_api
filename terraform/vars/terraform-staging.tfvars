environment               = "staging"
logger_level                 = "info"
desired_count             = 1
auto_scaling_min_capacity = 1
auto_scaling_max_capacity = 15

container_port=80
node_path="app/src"
node_env="staging"
suppress_no_config_warning="true"
control_tower_url="https://api.resourcewatch.org"
areas_api_url="https://api.resourcewatch.org"
geostore_api_url="https://api.resourcewatch.org"
api_version="v1"