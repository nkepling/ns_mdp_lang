"""
This is where the implementation of the plugin code goes.
The ExperimentCodeGenerator-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger('ExperimentCodeGenerator')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class ExperimentCodeGenerator(PluginBase):
    def main(self):
        active_node = self.active_node
        core = self.core
        logger = self.logger
        nodes = core.load_sub_tree(active_node)
        
        META = self.META

        if core.is_type_of(active_node, META["Experiment"]):
            logger.info('Active node is of type Experiment')
        else:
            logger.error('Active node is not of type Experiment')
            return
        
        for node in nodes:
            logger.debug('[{0}] has name: {1}'.format(core.get_path(node),core.get_attribute(node, 'name')))

        logger.info('Total number of nodes in the subtree: {0}'.format(len(nodes)))


        
        #Initialize the nodes map
        nodes_map = {
            "gym_env": None,
            "wrapper": None,
            "agent": None,
            "update_function": [],
        }
        

        # Parse Node types
        for node in nodes:
            if core.is_type_of(node, META["GymnasiumEnvironment"]):
                nodes_map["gym_env"] = node

            elif core.is_type_of(node, META["NSWrapper"]):
                nodes_map["wrapper"] = node

            elif core.is_type_of(node, META["Agent"]):
                nodes_map["agent"] = node

            elif core.is_type_of(node, META["UpdateFunction"]):
                nodes_map["update_function"].append(node)
                
                
            if not nodes_map["gym_env"]:
                logger.error("No GymnasiumEnvironment node found! Aborting plugin execution.")
            
            if not nodes_map["agent"]:
                logger.error("No agent found! Aborting")
            
        
        #############################################
        ### Start code gen ###########################
        #############################################
        
        
        # Start generating the experiment code
        exp_name = core.get_attribute(active_node, "name")
        exp_code = "import ns_gym\nimport gymnasium as gym\nimport numpy as np\n\n"

        ####### Make Env #########################
        
        make_env = "def make_env():\n"
        make_env += "  env = gym.make('{0}')\n".format(core.get_attribute(nodes_map["gym_env"],"name"))
        
        # Get Distribution function and scheduler
        
        param_list = []
        for ind,fn in enumerate(nodes_map["update_function"]):
        
            logger.debug(fn)
            
            args = core.get_attribute_names(fn)
            fn_args = {}
            
            # Get upadte fn args
            for arg in args:
                if arg == "name":
                    fn_name = core.get_attribute(fn,"name")
                elif arg == "tunable_param":
                    param = core.get_attribute(fn,"tunable_param")
                    if not param:
                        logger.error("Update function must have a tunable parameter")
                    param_list.append(param)
                elif arg == "pythonCode":
                    continue
                else:
                    fn_args[arg] = core.get_attribute(fn,arg)
                
            #Get scheduler
            
            scheduler = core.load_children(fn)
            
            if not len(scheduler) == 1:
                logger.error("Need exactly one scheduler")
                
            s = scheduler[0]
            sched_args = {}
            #sched_args_name = {n:None for n in core.get_attribute_names(s)}
            sched_args_name = core.get_attribute_names(s)
            logger.debug(f"sched args:, {sched_args}")
            for arg in sched_args_name:
                if arg == "name":
                    sched_name = core.get_attribute(s,"name")
                elif arg == "pythonCode":
                    continue
                else:
                    sched_args[arg] = core.get_attribute(s,arg)
                
            #add code
            sa = ", ".join(f"{k}={v}" for k, v in sched_args.items())
            make_env += f"  scheduler_{ind} = {sched_name}({sa}) \n"
            da = ", ".join(f"{k}={v}" for k, v in fn_args.items())
            make_env += f"  upateFn_{ind} = {fn_name}(scheduler_{ind}, {da}) \n"
        
        # Map parametrs to update functions
        make_env += "  param_map = {" + ", ".join(f"{param}:updateFn_{ind}" for ind,param in enumerate(param_list)) + "}\n"
        
        # Makewrapper:
        
        wrapper_name = core.get_attribute(nodes_map["wrapper"],"name")
        wn = core.get_attribute_names(nodes_map["wrapper"])
        wv = [core.get_attribute(nodes_map["wrapper"],n) for n in wn]
        
        wrapper_args = ", ".join(f"{k}={v}" for k, v in zip(wn, wv) if k not in {"name", "pythonCode"})
        
        
        make_env +="  ns_env = " +  wrapper_name + "(env, param_map, " + wrapper_args + ")\n"
        make_env +="  return ns_env\n"
        
        exp_code += make_env
        exp_code += "\n\n"
        
        
        
        ######### Run episode loop ################
        
        run_episode = """def run_episode(ns_env,agent):
    obs,info = ns_env.reset() 
    obs,_ = ns_gym.utils.type_mismatch_checker(obs,None)
    episode_reward = 0
    episode_trace = []
    
    done = False
    truncated = False
    while not done and not truncated:
        action = agent.act(obs,ns_env.get_planning_env())
        next_obs,reward,done,truncated,info = ns_env.step(action)
        next_obs,reward = ns_gym.utils.type_mismatch_checker(next_obs,reward)
        episode_reward += reward
        episode_trace.append((obs,action,reward,next_obs))
        obs = next_obs
    
    return episode_reward,episode_trace
        """
    
        exp_code+= run_episode + "\n\n"
        
        
        ############ Agent Set up #################
        ########################################
        
        agent_name = core.get_attribute(nodes_map["agent"],"name")
        agent_arg_names = core.get_attribute_names(nodes_map["agent"])
        agent_arg_vals = [core.get_attribute(nodes_map["agent"], n) for n in agent_arg_names]
        
        agent_args = ", ".join(f"{k}={v}" for k, v in zip(agent_arg_names, agent_arg_vals) if k not in {"name", "pythonCode"})
        
        
        agent_code = "  agent = " + agent_name + f"({agent_args})\n"
        
        
        
        ######## Run experiment loop #############
        
        main_loop = """def main(num_episodes):
    reward_list = []
    episode_traces = {}
    
    ns_env = make_env()
        """
        
        main_loop += "\n" + agent_code
        
        main_loop += """  for ep in range(num_episodes):
        episode_reward,episode_trace = run_episode()
        reward_list.append(episode_reward)
        episode_traces[ep] = episode_trace
        
    return reward_list,episode_traces
    """
        
        num_episodes = core.get_attribute(active_node,"num_episodes")
        
        exp_code += main_loop + "\n\n"
        
        exp_code += "main({0})".format(num_episodes)
        
        ######## Save Code to File #################
        logger.debug(exp_code)
        
        
        # Saving the resulting code
        file_hash = self.add_file(exp_name + '.py', exp_code)
        core.set_attribute(active_node, 'code', file_hash)
        self.util.save(self.root_node, self.commit_hash, branch_name=self.branch_name, msg='code saved into model')
        
        
        

        
        
        
        

