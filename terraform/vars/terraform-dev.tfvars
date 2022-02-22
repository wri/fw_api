environment               = "dev"
logger_level                 = "debug"
desired_count             = 1
auto_scaling_min_capacity = 1
auto_scaling_max_capacity = 5

container_port=80
node_path="app/src"
node_env="dev"
suppress_no_config_warning="true"
control_tower_url="https://api.resourcewatch.org"
forms_api_url="http://fw-forms-develop:4401/api/v1" // put in file
areas_api_url="https://api.resourcewatch.org"
geostore_api_url="https://api.resourcewatch.org"
api_version="v1"
