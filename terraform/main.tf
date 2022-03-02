terraform {
  backend "s3" {
    region  = "us-east-1"
    key     = "wri__fw_api.tfstate"
    encrypt = true
  }
}

provider "aws" {
  region = var.region
}


# Docker image for FW Template app
module "app_docker_image" {
  source     = "git::https://github.com/wri/gfw-terraform-modules.git//terraform/modules/container_registry?ref=v0.5.1"
  image_name = lower("${var.project_prefix}-docker")
  root_dir   = "${path.root}/../"
  tag        = local.container_tag
}

module "fargate_autoscaling" {
  source                       = "git::https://github.com/wri/gfw-terraform-modules.git//terraform/modules/fargate_autoscaling_v2?ref=v0.5.5"
  project                      = var.project_prefix
  tags                         = local.fargate_tags
  vpc_id                       = data.terraform_remote_state.core.outputs.vpc_id
  private_subnet_ids           = data.terraform_remote_state.core.outputs.private_subnet_ids
  public_subnet_ids            = data.terraform_remote_state.core.outputs.public_subnet_ids
  container_name               = var.project_prefix
  container_port               = var.container_port
  desired_count                = var.desired_count
  fargate_cpu                  = var.fargate_cpu
  fargate_memory               = var.fargate_memory
  auto_scaling_cooldown        = var.auto_scaling_cooldown
  auto_scaling_max_capacity    = var.auto_scaling_max_capacity
  auto_scaling_max_cpu_util    = var.auto_scaling_max_cpu_util
  auto_scaling_min_capacity    = var.auto_scaling_min_capacity
  load_balancer_arn            = data.terraform_remote_state.fw_core.outputs.lb_arn
  load_balancer_security_group = data.terraform_remote_state.fw_core.outputs.lb_security_group_id
  cluster_id                   = data.terraform_remote_state.fw_core.outputs.ecs_cluster_id
  cluster_name                 = data.terraform_remote_state.fw_core.outputs.ecs_cluster_name
  security_group_ids           = [data.terraform_remote_state.core.outputs.document_db_security_group_id, data.terraform_remote_state.core.outputs.redis_security_group_id]
  task_role_policies = [
    data.terraform_remote_state.fw_core.outputs.data_bucket_write_policy_arn
  ]
  task_execution_role_policies = [
    data.terraform_remote_state.core.outputs.document_db_secrets_policy_arn,
  ]
  container_definition = data.template_file.container_definition.rendered

  # Listener rule inputs
  lb_target_group_arn = module.fargate_autoscaling.lb_target_group_arn
  listener_arn        = data.terraform_remote_state.fw_core.outputs.lb_listener_arn
  project_prefix      = var.project_prefix
  path_pattern        = ["/api/v1/fw_api/healthcheck", "/api/v1/forest-watcher*"]
  health_check_path = "/api/v1/fw_api/healthcheck"
  priority = 6

  depends_on = [
    module.app_docker_image
  ]
}



data "template_file" "container_definition" {
  template = file("${path.root}/templates/container_definition.json.tmpl")
  vars = {
    # Required to deploy container
    container_name = var.project_prefix
    image          = "${module.app_docker_image.repository_url}:${local.container_tag}"
    container_port = var.container_port
    log_group      = aws_cloudwatch_log_group.default.name
    aws_region     = var.region
    environment    = var.environment
    
    # Environment variables
    PORT = var.container_port
    NODE_PATH = var.node_path
    NODE_ENV = var.node_env
    LOGGER_LEVEL = var.logger_level
    SUPPRESS_NO_CONFIG_WARNING = var.suppress_no_config_warning
    CT_URL = var.control_tower_url
    LOCAL_URL = "http://127.0.0.1:${var.container_port}"
    FORMS_API_URL = "http://${data.terraform_remote_state.fw_core.outputs.public_url}/api/v1"
    AREAS_API_URL = var.areas_api_url
    GEOSTORE_API_URL = var.geostore_api_url
    api_version = var.api_version
    # Secrets
    # none
  }

}


#
# CloudWatch Resources
#
resource "aws_cloudwatch_log_group" "default" {
  name              = "/aws/ecs/${var.project_prefix}-logs"
  retention_in_days = var.log_retention
}